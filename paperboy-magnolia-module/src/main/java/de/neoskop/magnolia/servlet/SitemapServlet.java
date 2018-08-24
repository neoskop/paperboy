package de.neoskop.magnolia.servlet;

import static info.magnolia.repository.RepositoryConstants.WEBSITE;

import com.google.gson.Gson;
import info.magnolia.context.MgnlContext;
import info.magnolia.jcr.predicate.NodeTypePredicate;
import info.magnolia.jcr.util.NodeTypes.Page;
import info.magnolia.jcr.util.NodeUtil;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.jcr.InvalidItemStateException;
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * @author Arne Diekmann
 * @since 15.12.17
 */
public class SitemapServlet extends HttpServlet {
  private static final Logger LOG = LogManager.getLogger(SitemapServlet.class);

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    try {
      final Node rootNode = MgnlContext.getInstance().getJCRSession(WEBSITE).getRootNode();
      final List<String> paths = new ArrayList<>();
      final Iterable<Node> nodeIt =
          NodeUtil.collectAllChildren(rootNode, new NodeTypePredicate(Page.NAME));

      for (Node node : nodeIt) {
        try {
          paths.add(node.getPath());
        } catch (InvalidItemStateException ignored) {
        }
      }

      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.getWriter().write(new Gson().toJson(paths));
    } catch (RepositoryException e) {
      LOG.error("Could not retrieve pages", e);
      response.sendError(500);
    }
  }
}
