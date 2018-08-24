package de.neoskop.magnolia.action.definition;

import de.neoskop.magnolia.action.PreviewPageAction;
import info.magnolia.ui.api.action.ConfiguredActionDefinition;

public class PreviewPageActionDefinition extends ConfiguredActionDefinition {
  public PreviewPageActionDefinition() {
    setImplementationClass(PreviewPageAction.class);
  }
}
