package com.dailycode.chat_app;

import java.util.HashSet;
import java.util.Set;

public class ChatRoom {
    private String roomName;
    private Set<String> users;

    public ChatRoom(String roomName) {
        this.roomName = roomName;
        this.users = new HashSet<>();
    }

    public String getRoomName() {
        return roomName;
    }

    public Set<String> getUsers() {
        return users;
    }

    public void addUser(String username) {
        users.add(username);
    }

    public void removeUser(String username) {
        users.remove(username);
    }

    public boolean hasUser(String username) {
        return users.contains(username);
    }
}
