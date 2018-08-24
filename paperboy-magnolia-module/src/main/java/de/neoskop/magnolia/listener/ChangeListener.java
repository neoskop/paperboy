package de.neoskop.magnolia.listener;

import info.magnolia.jcr.util.NodeTypes;
import info.magnolia.module.observation.BaseConfiguration;
import info.magnolia.module.observation.ObservationConfiguration;
import javax.jcr.RepositoryException;
import javax.jcr.observation.Event;

/**
 * @author Arne Diekmann
 * @since 03.01.18
 */
public abstract class ChangeListener implements BaseConfiguration {
  private ObservationConfiguration obs;

  boolean shouldProcess(Event event) throws RepositoryException {
    String path = event.getPath();
    return !(path.contains(NodeTypes.JCR_PREFIX) || path.contains(NodeTypes.MGNL_PREFIX));
  }

  @Override
  public ObservationConfiguration getConfiguration() {
    return obs;
  }

  @Override
  public void setConfiguration(ObservationConfiguration obs) {
    this.obs = obs;
  }

  String getRepository() {
    return obs.getRepository();
  }
}
