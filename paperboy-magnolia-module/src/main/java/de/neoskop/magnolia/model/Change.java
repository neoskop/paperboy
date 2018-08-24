package de.neoskop.magnolia.model;

import com.google.gson.Gson;

/**
 * @author Arne Diekmann
 * @since 18.12.17
 */
public class Change {
  private final String workspace;

  public Change(String workspace) {
    this.workspace = workspace;
  }

  public String getWorkspace() {
    return workspace;
  }

  public String toJson() {
    return new Gson().toJson(this);
  }
}
