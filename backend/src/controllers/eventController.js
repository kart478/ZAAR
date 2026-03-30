import { store, generateId } from '../data/store.js';
import { createSuccessResponse, createErrorResponse, sendResponse } from '../utils/response.js';

export const createEvent = async (req, res) => {
  try {
    const { title, description, startTime, endTime, location, onlineLink, communityId, bannerUrl } = req.body;
    const userId = req.user.id;

    // Check if user is owner or moderator of the community
    const membership = store.memberships.get(`${communityId}-${userId}`);
    if (!membership || !['owner', 'moderator'].includes(membership.role)) {
      return sendResponse(res, 403, createErrorResponse('Must be owner or moderator to create events'));
    }

    const event = {
      id: generateId(),
      title,
      description,
      startTime,
      endTime,
      location: location || null,
      onlineLink: onlineLink || null,
      communityId,
      bannerUrl: bannerUrl || null,
      createdBy: userId,
      rsvps: new Map(),
      createdAt: new Date().toISOString()
    };

    store.events.set(event.id, event);

    // Get creator and community info for response
    const creator = store.users.get(userId);
    const community = store.communities.get(communityId);
    
    const eventWithDetails = {
      ...event,
      rsvps: Array.from(event.rsvps.entries()).map(([userId, status]) => ({ userId, status })),
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

    sendResponse(res, 201, createSuccessResponse(eventWithDetails, 'Event created successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to create event'));
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    const { communityId, page, limit } = req.query;
    const offset = (page - 1) * limit;

    let events = Array.from(store.events.values()).filter(
      event => new Date(event.startTime) > new Date()
    );

    // Filter by community if provided
    if (communityId) {
      events = events.filter(event => event.communityId === communityId);
    }

    // Sort by start time (soonest first)
    events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Pagination
    const total = events.length;
    const paginatedEvents = events.slice(offset, offset + limit);

    // Add creator, community, and RSVP info
    const eventsWithDetails = paginatedEvents.map(event => {
      const creator = store.users.get(event.createdBy);
      const community = store.communities.get(event.communityId);
      
      return {
        ...event,
        rsvps: Array.from(event.rsvps.entries()).map(([userId, status]) => ({ userId, status })),
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

    sendResponse(res, 200, createSuccessResponse(eventsWithDetails, 'Upcoming events retrieved successfully', {
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
    sendResponse(res, 500, createErrorResponse('Failed to retrieve upcoming events'));
  }
};

export const rsvpEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const event = store.events.get(id);
    if (!event) {
      return sendResponse(res, 404, createErrorResponse('Event not found'));
    }

    // Update RSVP
    event.rsvps.set(userId, status);
    store.events.set(id, event);

    // Get RSVP counts
    const rsvpCounts = {
      going: 0,
      interested: 0,
      notGoing: 0
    };

    for (const [, rsvpStatus] of event.rsvps) {
      rsvpCounts[rsvpStatus]++;
    }

    sendResponse(res, 200, createSuccessResponse({
      userRsvp: status,
      counts: rsvpCounts
    }, 'RSVP updated successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Failed to update RSVP'));
  }
};
