package de.neoskop.magnolia.listener;

import static javax.jcr.observation.Event.PROPERTY_ADDED;
import static javax.jcr.observation.Event.PROPERTY_CHANGED;
import static javax.jcr.observation.Event.PROPERTY_REMOVED;

import de.neoskop.magnolia.model.DetailedChange;
import de.neoskop.magnolia.service.ChangeAnnouncementService;
import info.magnolia.objectfactory.Components;
import java.util.HashSet;
import java.util.Set;
import javax.jcr.RepositoryException;
import javax.jcr.observation.Event;
import javax.jcr.observation.EventIterator;
import javax.jcr.observation.EventListener;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * @author Arne Diekmann
 * @since 03.01.18
 */
public class DetailedChangeListener extends ChangeListener implements EventListener {
  private static final Logger LOG = LogManager.getLogger(DetailedChangeListener.class);

  @Override
  public void onEvent(EventIterator events) {
    Set<DetailedChange> changes = new HashSet<>();

    try {
      while (events.hasNext()) {
        final Event event = events.nextEvent();
        String path = event.getPath();

        if (shouldProcess(event)) {
          switch (event.getType()) {
            case PROPERTY_CHANGED:
            case PROPERTY_ADDED:
            case PROPERTY_REMOVED:
              path = StringUtils.substringBeforeLast(path, "/");
          }

          final DetailedChange change =
              new DetailedChange(getRepository(), event.getIdentifier(), path);
          changes.add(change);
        }
      }
    } catch (RepositoryException e) {
      LOG.error("Could not process change events", e);
    }

    changes.forEach(c -> Components.getComponent(ChangeAnnouncementService.class).announce(c));
  }
}
