package de.neoskop.magnolia.extension;

import de.neoskop.magnolia.PaperboyModule;
import info.magnolia.event.EventBus;
import info.magnolia.link.LinkUtil;
import info.magnolia.pages.app.editor.extension.AbstractExtension;
import info.magnolia.pages.app.editor.pagebar.nativepagepreviewlink.NativePagePreviewLinkExtensionDefinition;
import info.magnolia.pages.app.editor.pagebar.nativepagepreviewlink.NativePagePreviewLinkView;
import info.magnolia.pages.app.editor.parameters.PageEditorStatus;
import info.magnolia.ui.api.app.SubAppEventBus;
import info.magnolia.ui.api.view.View;
import info.magnolia.ui.contentapp.detail.DetailLocation;
import info.magnolia.ui.vaadin.editor.events.PageEditorNavigationEvent;
import java.net.MalformedURLException;
import java.net.URL;
import javax.inject.Inject;
import javax.inject.Named;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class NativePagePreviewLink extends AbstractExtension {
  private final NativePagePreviewLinkView view;
  private final NativePagePreviewLinkExtensionDefinition definition;
  private final EventBus subAppEventBus;
  private final PaperboyModule module;
  private String url = StringUtils.EMPTY;
  private static final Logger LOG = LogManager.getLogger(NativePagePreviewLink.class);

  @Inject
  public NativePagePreviewLink(
      NativePagePreviewLinkExtensionDefinition definition,
      NativePagePreviewLinkView view,
      @Named(SubAppEventBus.NAME) EventBus subAppEventBus,
      PaperboyModule module) {
    this.view = view;
    this.definition = definition;
    this.subAppEventBus = subAppEventBus;
    this.module = module;
  }

  @Override
  public View start(DetailLocation location) {
    subAppEventBus.addHandler(
        PageEditorNavigationEvent.class,
        event -> {
          try {
            final String newUrl = module.getPreviewUrl() + new URL(event.getUrl()).getPath();

            if (!this.url.equals(newUrl)) {
              updateView(addVersionParameter(newUrl, location.getVersion()));
            }
          } catch (MalformedURLException e) {
            LOG.error("Event URL could not be parsed", e);
          }
        });

    return view;
  }

  @Override
  public void onLocationUpdate(DetailLocation location) {
    // Do not do anything, we relied on event bus to update link
  }

  @Override
  public void deactivate() {
    view.setVisible(false);
  }

  /** Add version parameter for showing page with version just in case. */
  private String addVersionParameter(String uri, String version) {
    if (StringUtils.isEmpty(uri) || StringUtils.isEmpty(version)) {
      return uri;
    }

    if (!uri.contains(PageEditorStatus.VERSION_PARAMETER)) {
      StringBuffer sb = new StringBuffer(uri);
      LinkUtil.addParameter(sb, PageEditorStatus.VERSION_PARAMETER, version);
      uri = sb.toString();
    }

    return uri;
  }

  private void updateView(String url) {
    if (StringUtils.isNotEmpty(definition.getTarget())) {
      view.setTarget(definition.getTarget());
    }
    view.setLink(url);
    view.setVisible(definition.isVisible());
    this.url = url;
  }
}
