package de.neoskop.magnolia.listener;

import de.neoskop.magnolia.model.Change;
import de.neoskop.magnolia.service.ChangeAnnouncementService;
import info.magnolia.objectfactory.Components;
import javax.jcr.RepositoryException;
import javax.jcr.observation.Event;
import javax.jcr.observation.EventIterator;
import javax.jcr.observation.EventListener;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * @author Arne Diekmann
 * @since 03.01.18
 */
public class FuzzyChangeListener extends ChangeListener implements EventListener {
  private static final Logger LOG = LogManager.getLogger(FuzzyChangeListener.class);

  @Override
  public void onEvent(EventIterator events) {
    boolean relevantEventOccurred = false;

    try {
      while (events.hasNext()) {
        final Event event = events.nextEvent();

        if (shouldProcess(event)) {
          relevantEventOccurred = true;
          break;
        }
      }
    } catch (RepositoryException e) {
      LOG.error("Could not process change events", e);
      relevantEventOccurred = true;
    }

    if (relevantEventOccurred) {
      final Change change = new Change(getRepository());
      Components.getComponent(ChangeAnnouncementService.class).announce(change);
    }
  }
}
