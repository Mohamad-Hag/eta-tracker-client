import axios from "axios";
import HOST from "../consts/host";
import { TransportMode } from "../typings/TransportMode";

export async function getEventById(id: string) {
  try {
    const response = await axios.get(`${HOST}/api/events/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching event data:", error);
    throw error;
  }
}

export async function joinEvent(id: string, guestId: string, socketId: string) {
  try {
    const response = await axios.post(`${HOST}/api/events/join/${id}`, {
      guest_id: guestId,
      socket_id: socketId,
    });
    return response.data;
  } catch (error) {
    console.error("Error joining event:", error);
    throw error;
  }
}

export async function leaveEvent(id: string, guestId: string) {
  try {
    const response = await axios.post(`${HOST}/api/events/leave/${id}`, {
      guest_id: guestId,
    });
    return response.data;
  } catch (error) {
    console.error("Error leaving event:", error);
    throw error;
  }
}

export async function updateLocation(
  location: string,
  guestId: string,
  eventId: string,
  socketId: string,
  transportMode: TransportMode
) {
  try {
    const response = await axios.post(`${HOST}/api/locations/update`, {
      location: location,
      guest_id: guestId,
      event_id: eventId,
      socket_id: socketId,
      transport_mode: transportMode,
    });
    console.log("Location Update Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating event location:", error);
    throw error;
  }
}

export default async function getEventJoiners(id: string) {
  try {
    const response = await axios.get(`${HOST}/api/events/joiners/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching event joiners:", error);
    throw error;
  }
}

export async function isGuestInEvent(guestId: string) {
  try {
    const response = await axios.get(
      `${HOST}/api/events/isGuestInEvent/${guestId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching event joiners:", error);
    throw error;
  }
}
