import { getRequest, postRequest } from "./viewService";
import { measurePerformance, cacheMonitor } from "../utils/performance";

// Simple in-memory cache for events
const eventCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache key generator
const getCacheKey = (page, pageSize, searchQuery) => 
  `events_${page}_${pageSize}_${searchQuery}`;

// Check if cache is valid
const isCacheValid = (timestamp) => 
  Date.now() - timestamp < CACHE_DURATION;

// Get events with caching
export const getEventsList = async (page = 1, pageSize = 10, searchQuery = "") => {
  const cacheKey = getCacheKey(page, pageSize, searchQuery);
  const cached = eventCache.get(cacheKey);
  
  // Return cached data if valid
  if (cached && isCacheValid(cached.timestamp)) {
    cacheMonitor.recordHit();
    return cached.data;
  }
  
  cacheMonitor.recordMiss();
  
  return measurePerformance.measureAPI(
    `getEventsList(page=${page}, search="${searchQuery}")`,
    async () => {
      try {
        const response = await getRequest(
          `get-event-host-list?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery}`
        );
        
        if (response.status === 1) {
          // Cache the successful response
          eventCache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
          });
          
          // Clean old cache entries (simple cleanup)
          if (eventCache.size > 50) {
            const oldestKey = eventCache.keys().next().value;
            eventCache.delete(oldestKey);
          }
        }
        
        return response;
      } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
      }
    }
  );
};

// Clear cache (useful after creating/updating events)
export const clearEventsCache = () => {
  eventCache.clear();
};

// Pre-computed event status cache
const statusCache = new Map();

export const getEventStatus = (event) => {
  const cacheKey = `${event._id}_${event.endDate}_${event.endTime}`;
  
  if (statusCache.has(cacheKey)) {
    return statusCache.get(cacheKey);
  }
  
  const now = new Date();
  const eventEndDateTime = new Date(`${event.endDate}T${event.endTime}:00`);
  
  let status = "";
  if (now >= new Date(`${event.startDate}T${event.startTime}:00`) && now <= eventEndDateTime) {
    status = "Ongoing";
  } else {
    status = now < eventEndDateTime ? "Incoming" : "Completed";
  }

  statusCache.set(cacheKey, status);
  return status;
};

// Get events by company for admin users
export const getEventsListByCompany = async (companyId, page = 1, pageSize = 10, searchQuery = "") => {
  const cacheKey = getCacheKey(`company_${companyId}_${page}`, pageSize, searchQuery);
  const cached = eventCache.get(cacheKey);
  
  // Return cached data if valid
  if (cached && isCacheValid(cached.timestamp)) {
    cacheMonitor.recordHit();
    return cached.data;
  }
  
  cacheMonitor.recordMiss();
  
  return measurePerformance.measureAPI(
    `getEventsListByCompany(companyId=${companyId}, page=${page}, search="${searchQuery}")`,
    async () => {
      try {
        const response = await getRequest(
          `get-event-host-list-by-company?companyId=${companyId}&page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery}`
        );
        
        if (response.status === 1) {
          // Cache the successful response
          eventCache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
          });
          
          // Clean old cache entries (simple cleanup)
          if (eventCache.size > 50) {
            const oldestKey = eventCache.keys().next().value;
            eventCache.delete(oldestKey);
          }
        }
        
        return response;
      } catch (error) {
        console.error("Error fetching events by company:", error);
        throw error;
      }
    }
  );
};

// Clear status cache periodically
setInterval(() => {
  statusCache.clear();
}, 60000); // Clear every minute

// Copy an existing event host
export const copyEventHost = async (eventId) => {
  return measurePerformance.measureAPI(
    `copyEventHost(eventId=${eventId})`,
    async () => {
      try {
        const response = await postRequest(`copy-event-host/${eventId}`, {});
        
        if (response.status === 1) {
          // Clear cache after successful copy
          clearEventsCache();
        }
        
        return response;
      } catch (error) {
        console.error("Error copying event:", error);
        throw error;
      }
    }
  );
};
