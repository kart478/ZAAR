import { store, generateId } from '../data/store.js';
import { createSuccessResponse, createErrorResponse, sendResponse } from '../utils/response.js';

export const createCommunity = async (req, res) => {
  try {
    const { name, description, category, coverImageUrl, iconUrl, rules, isPrivate } = req.body;
    const userId = req.user.id;

    // Generate unique slug
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let uniqueSlug = slug;
    let counter = 1;
    
    while (Array.from(store.communities.values()).some(c => c.slug === uniqueSlug)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const community = {
      id: generateId(),
      name,
      slug: uniqueSlug,
      description,
      category,
      coverImageUrl: coverImageUrl || null,
      iconUrl: iconUrl || null,
      rules: rules || [],
      isPrivate: isPrivate || false,
      createdBy: userId,
      membersCount: 1,
      createdAt: new Date().toISOString()
    };

    store.communities.set(community.id, community);

    // Add creator as owner
    const membership = {
      id: generateId(),
      userId,
      communityId: community.id,
      role: 'owner',
      joinedAt: new Date().toISOString()
    };
    store.memberships.set(`${community.id}-${userId}`, membership);

    sendResponse(res, 201, createSuccessResponse(community, 'Community created successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to create community'));
  }
};

export const listCommunities = async (req, res) => {
  try {
    const { search, category, sort, page, limit } = req.query;
    const offset = (page - 1) * limit;

    let communities = Array.from(store.communities.values());

    // Filter by search
    if (search) {
      communities = communities.filter(community =>
        community.name.toLowerCase().includes(search.toLowerCase()) ||
        community.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category
    if (category) {
      communities = communities.filter(community =>
        community.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Sort
    switch (sort) {
      case 'trending':
        communities.sort((a, b) => b.membersCount - a.membersCount);
        break;
      case 'newest':
        communities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'members':
        communities.sort((a, b) => b.membersCount - a.membersCount);
        break;
      default:
        communities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const total = communities.length;
    const paginatedCommunities = communities.slice(offset, offset + limit);

    // Add creator info
    const communitiesWithCreator = paginatedCommunities.map(community => {
      const creator = store.users.get(community.createdBy);
      return {
        ...community,
        creator: creator ? {
          id: creator.id,
          name: creator.name,
          username: creator.username,
          avatarUrl: creator.avatarUrl
        } : null
      };
    });

    sendResponse(res, 200, createSuccessResponse(communitiesWithCreator, 'Communities retrieved successfully', {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to retrieve communities'));
  }
};

export const getCommunity = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const community = Array.from(store.communities.values()).find(
      c => c.id === idOrSlug || c.slug === idOrSlug
    );

    if (!community) {
      return sendResponse(res, 404, createErrorResponse('Community not found'));
    }

    // Get creator info
    const creator = store.users.get(community.createdBy);
    
    // Get members
    const memberships = Array.from(store.memberships.values()).filter(
      m => m.communityId === community.id
    );
    
    const members = memberships.map(membership => {
      const user = store.users.get(membership.userId);
      return user ? {
        id: user.id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: membership.role,
        joinedAt: membership.joinedAt
      } : null;
    }).filter(Boolean);

    const communityWithDetails = {
      ...community,
      creator: creator ? {
        id: creator.id,
        name: creator.name,
        username: creator.username,
        avatarUrl: creator.avatarUrl
      } : null,
      members
    };

    sendResponse(res, 200, createSuccessResponse(communityWithDetails, 'Community retrieved successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to retrieve community'));
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = store.communities.get(id);
    if (!community) {
      return sendResponse(res, 404, createErrorResponse('Community not found'));
    }

    // Check if already a member
    const existingMembership = store.memberships.get(`${id}-${userId}`);
    if (existingMembership) {
      return sendResponse(res, 400, createErrorResponse('Already a member of this community'));
    }

    // Add membership
    const membership = {
      id: generateId(),
      userId,
      communityId: id,
      role: 'member',
      joinedAt: new Date().toISOString()
    };
    store.memberships.set(`${id}-${userId}`, membership);

    // Update members count
    community.membersCount += 1;
    store.communities.set(id, community);

    sendResponse(res, 200, createSuccessResponse(null, 'Joined community successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to join community'));
  }
};

export const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = store.communities.get(id);
    if (!community) {
      return sendResponse(res, 404, createErrorResponse('Community not found'));
    }

    const membership = store.memberships.get(`${id}-${userId}`);
    if (!membership) {
      return sendResponse(res, 400, createErrorResponse('Not a member of this community'));
    }

    // Prevent owners from leaving
    if (membership.role === 'owner') {
      return sendResponse(res, 400, createErrorResponse('Community owners cannot leave their own community'));
    }

    // Remove membership
    store.memberships.delete(`${id}-${userId}`);

    // Update members count
    community.membersCount -= 1;
    store.communities.set(id, community);

    sendResponse(res, 200, createSuccessResponse(null, 'Left community successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to leave community'));
  }
};
