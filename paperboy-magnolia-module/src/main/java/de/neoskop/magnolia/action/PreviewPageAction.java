package de.neoskop.magnolia.action;

import com.vaadin.ui.UI;
import de.neoskop.magnolia.PaperboyModule;
import de.neoskop.magnolia.action.definition.PreviewPageActionDefinition;
import info.magnolia.context.MgnlContext;
import info.magnolia.jcr.util.NodeTypes;
import info.magnolia.objectfactory.Components;
import info.magnolia.ui.api.action.AbstractAction;
import info.magnolia.ui.api.action.ActionExecutionException;
import info.magnolia.ui.vaadin.integration.jcr.JcrItemAdapter;
import javax.inject.Inject;
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import org.apache.commons.lang.StringUtils;

public class PreviewPageAction<D extends PreviewPageActionDefinition> extends AbstractAction<D> {
  private JcrItemAdapter item;

  @Inject
  protected PreviewPageAction(D definition, JcrItemAdapter item) {
    super(definition);
    this.item = item;
  }

  @Override
  public void execute() throws ActionExecutionException {
    try {
      UI.getCurrent().getPage().open(getLivePreviewUrl(), "_blank");
    } catch (RepositoryException e) {
      throw new ActionExecutionException(e);
    }
  }

  private String getLivePreviewUrl() throws RepositoryException {
    final StringBuilder sb = new StringBuilder();
    final String previewUrl = Components.getComponent(PaperboyModule.class).getPreviewUrl();
    final String fallbackUrl = MgnlContext.getContextPath();
    sb.append(StringUtils.isBlank(previewUrl) ? fallbackUrl : previewUrl);

    if (item.getJcrItem().isNode()) {
      Node node = (Node) item.getJcrItem();

      while (!node.getPrimaryNodeType().isNodeType(NodeTypes.Page.NAME) && node.getDepth() > 0) {
        node = node.getParent();
      }

      sb.append(node.getPath());
    } else {
      sb.append(item.getJcrItem().getPath());
    }

    return sb.toString();
  }
}
