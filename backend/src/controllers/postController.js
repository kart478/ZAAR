import { store, generateId } from '../data/store.js';
import { createSuccessResponse, createErrorResponse, sendResponse } from '../utils/response.js';

export const createPost = async (req, res) => {
  try {
    const { content, imageUrl, communityId, tags } = req.body;
    const userId = req.user.id;

    // Validate community if provided
    if (communityId) {
      const community = store.communities.get(communityId);
      if (!community) {
        return sendResponse(res, 404, createErrorResponse('Community not found'));
      }

      // Check if user is a member of the community
      const membership = store.memberships.get(`${communityId}-${userId}`);
      if (!membership) {
        return sendResponse(res, 403, createErrorResponse('Must be a member to post in this community'));
      }
    }

    const post = {
      id: generateId(),
      authorId: userId,
      communityId: communityId || null,
      content,
      imageUrl: imageUrl || null,
      tags: tags || [],
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString()
    };

    store.posts.set(post.id, post);

    // Get author info for response
    const author = store.users.get(userId);
    const postWithAuthor = {
      ...post,
      author: author ? {
        id: author.id,
        name: author.name,
        username: author.username,
        avatarUrl: author.avatarUrl
      } : null
    };

    sendResponse(res, 201, createSuccessResponse(postWithAuthor, 'Post created successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to create post'));
  }
};

export const getGlobalFeed = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;

    let posts = Array.from(store.posts.values());

    // Sort by newest first
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = posts.length;
    const paginatedPosts = posts.slice(offset, offset + limit);

    // Add author and community info
    const postsWithDetails = paginatedPosts.map(post => {
      const author = store.users.get(post.authorId);
      const community = post.communityId ? store.communities.get(post.communityId) : null;
      
      return {
        ...post,
        author: author ? {
          id: author.id,
          name: author.name,
          username: author.username,
          avatarUrl: author.avatarUrl
        } : null,
        community: community ? {
          id: community.id,
          name: community.name,
          slug: community.slug,
          iconUrl: community.iconUrl
        } : null
      };
    });

    sendResponse(res, 200, createSuccessResponse(postsWithDetails, 'Feed retrieved successfully', {
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
    sendResponse(res, 500, createErrorResponse('Failed to retrieve feed'));
  }
};

export const getCommunityFeed = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;

    const community = store.communities.get(communityId);
    if (!community) {
      return sendResponse(res, 404, createErrorResponse('Community not found'));
    }

    let posts = Array.from(store.posts.values()).filter(
      post => post.communityId === communityId
    );

    // Sort by newest first
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = posts.length;
    const paginatedPosts = posts.slice(offset, offset + limit);

    // Add author info
    const postsWithDetails = paginatedPosts.map(post => {
      const author = store.users.get(post.authorId);
      
      return {
        ...post,
        author: author ? {
          id: author.id,
          name: author.name,
          username: author.username,
          avatarUrl: author.avatarUrl
        } : null
      };
    });

    sendResponse(res, 200, createSuccessResponse(postsWithDetails, 'Community feed retrieved successfully', {
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
    sendResponse(res, 500, createErrorResponse('Failed to retrieve community feed'));
  }
};

export const getPersonalizedFeed = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    // Get user's joined communities
    const userMemberships = Array.from(store.memberships.values()).filter(
      membership => membership.userId === userId
    );
    const communityIds = userMemberships.map(m => m.communityId);

    let posts = Array.from(store.posts.values()).filter(
      post => !post.communityId || communityIds.includes(post.communityId)
    );

    // Sort by newest first
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = posts.length;
    const paginatedPosts = posts.slice(offset, offset + limit);

    // Add author and community info
    const postsWithDetails = paginatedPosts.map(post => {
      const author = store.users.get(post.authorId);
      const community = post.communityId ? store.communities.get(post.communityId) : null;
      
      return {
        ...post,
        author: author ? {
          id: author.id,
          name: author.name,
          username: author.username,
          avatarUrl: author.avatarUrl
        } : null,
        community: community ? {
          id: community.id,
          name: community.name,
          slug: community.slug,
          iconUrl: community.iconUrl
        } : null
      };
    });

    sendResponse(res, 200, createSuccessResponse(postsWithDetails, 'Personalized feed retrieved successfully', {
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
    sendResponse(res, 500, createErrorResponse('Failed to retrieve personalized feed'));
  }
};

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = store.posts.get(id);
    if (!post) {
      return sendResponse(res, 404, createErrorResponse('Post not found'));
    }

    // Simple like implementation (in production, would track individual likes)
    post.likesCount += 1;
    store.posts.set(id, post);

    sendResponse(res, 200, createSuccessResponse({ likesCount: post.likesCount }, 'Post liked successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to like post'));
  }
};

export const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = store.posts.get(id);
    if (!post) {
      return sendResponse(res, 404, createErrorResponse('Post not found'));
    }

    // Simple unlike implementation
    if (post.likesCount > 0) {
      post.likesCount -= 1;
      store.posts.set(id, post);
    }

    sendResponse(res, 200, createSuccessResponse({ likesCount: post.likesCount }, 'Post unliked successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to unlike post'));
  }
};

export const sharePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = store.posts.get(id);
    if (!post) {
      return sendResponse(res, 404, createErrorResponse('Post not found'));
    }

    // Increment share count
    post.sharesCount += 1;
    store.posts.set(id, post);

    sendResponse(res, 200, createSuccessResponse({ sharesCount: post.sharesCount }, 'Post shared successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to share post'));
  }
};
