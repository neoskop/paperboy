package de.neoskop.magnolia.model;

import com.google.gson.Gson;

public class Message {
  private final String source;
  private final Change change;

  public Message(String source, Change change) {
    this.source = source;
    this.change = change;
  }

  public String source() {
    return source;
  }

  public Change getChange() {
    return change;
  }

  public String toJson() {
    return new Gson().toJson(this);
  }
}
