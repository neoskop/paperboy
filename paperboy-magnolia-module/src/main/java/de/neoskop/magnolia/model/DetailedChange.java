package de.neoskop.magnolia.model;

import java.util.Objects;

/**
 * @author Arne Diekmann
 * @since 03.01.18
 */
public class DetailedChange extends Change {
  private final String uuid;
  private final String path;

  public DetailedChange(String workspace, String uuid, String path) {
    super(workspace);
    this.uuid = uuid;
    this.path = path;
  }

  public String getUuid() {
    return uuid;
  }

  public String getPath() {
    return path;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    DetailedChange that = (DetailedChange) o;
    return Objects.equals(uuid, that.uuid);
  }

  @Override
  public int hashCode() {

    return Objects.hash(uuid);
  }
}
