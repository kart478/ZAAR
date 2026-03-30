import { store, generateId } from '../data/store.js';
import { createSuccessResponse, createErrorResponse, sendResponse } from '../utils/response.js';

export const createProject = async (req, res) => {
  try {
    const { title, description, techStack, repoUrl, demoUrl, communityId, rolesNeeded } = req.body;
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
        return sendResponse(res, 403, createErrorResponse('Must be a member to post projects in this community'));
      }
    }

    const project = {
      id: generateId(),
      title,
      description,
      techStack,
      repoUrl: repoUrl || null,
      demoUrl: demoUrl || null,
      communityId: communityId || null,
      rolesNeeded: rolesNeeded || [],
      createdBy: userId,
      createdAt: new Date().toISOString()
    };

    store.projects.set(project.id, project);

    // Get creator and community info for response
    const creator = store.users.get(userId);
    const community = communityId ? store.communities.get(communityId) : null;
    
    const projectWithDetails = {
      ...project,
      creator: creator ? {
        id: creator.id,
        name: creator.name,
        username: creator.username,
        avatarUrl: creator.avatarUrl
      } : null,
      community: community ? {
        id: community.id,
        name: community.name,
        slug: community.slug,
        iconUrl: community.iconUrl
      } : null
    };

    sendResponse(res, 201, createSuccessResponse(projectWithDetails, 'Project created successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to create project'));
  }
};

export const getProjects = async (req, res) => {
  try {
    const { communityId, search, page, limit } = req.query;
    const offset = (page - 1) * limit;

    let projects = Array.from(store.projects.values());

    // Filter by community
    if (communityId) {
      projects = projects.filter(project => project.communityId === communityId);
    }

    // Filter by search
    if (search) {
      projects = projects.filter(project =>
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase()) ||
        project.techStack.some(tech => tech.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Sort by newest first
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = projects.length;
    const paginatedProjects = projects.slice(offset, offset + limit);

    // Add creator and community info
    const projectsWithDetails = paginatedProjects.map(project => {
      const creator = store.users.get(project.createdBy);
      const community = project.communityId ? store.communities.get(project.communityId) : null;
      
      return {
        ...project,
        creator: creator ? {
          id: creator.id,
          name: creator.name,
          username: creator.username,
          avatarUrl: creator.avatarUrl
        } : null,
        community: community ? {
          id: community.id,
          name: community.name,
          slug: community.slug,
          iconUrl: community.iconUrl
        } : null
      };
    });

    sendResponse(res, 200, createSuccessResponse(projectsWithDetails, 'Projects retrieved successfully', {
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
    sendResponse(res, 500, createErrorResponse('Failed to retrieve projects'));
  }
};

export const requestCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const project = store.projects.get(id);
    if (!project) {
      return sendResponse(res, 404, createErrorResponse('Project not found'));
    }

    // Check if already requested
    const existingRequest = Array.from(store.collaborationRequests.values()).find(
      request => request.projectId === id && request.userId === userId
    );

    if (existingRequest) {
      return sendResponse(res, 400, createErrorResponse('Collaboration request already sent'));
    }

    const collaborationRequest = {
      id: generateId(),
      projectId: id,
      userId,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    store.collaborationRequests.set(collaborationRequest.id, collaborationRequest);

    // Get user info for response
    const user = store.users.get(userId);
    const requestWithUser = {
      ...collaborationRequest,
      user: user ? {
        id: user.id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl
      } : null
    };

    sendResponse(res, 201, createSuccessResponse(requestWithUser, 'Collaboration request sent successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to send collaboration request'));
  }
};
