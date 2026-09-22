import { client } from "./client";

export const fetchMyNotifications = () =>
  client.get("/api/notification/me").then((r) => r.data);

export const deleteNotification = (id) =>
  client.delete(`/api/notification/${id}`);
