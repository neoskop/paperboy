package de.neoskop.magnolia.task;

import info.magnolia.cms.security.SecurityUtil;
import info.magnolia.module.InstallContext;
import info.magnolia.module.delta.AbstractTask;
import info.magnolia.module.delta.TaskExecutionException;
import info.magnolia.repository.RepositoryConstants;
import javax.jcr.Node;
import javax.jcr.Property;
import javax.jcr.RepositoryException;
import javax.jcr.Session;

public class ChangePasswordTask extends AbstractTask {
  private String password, username;

  public ChangePasswordTask(String userPath, String password) {
    super("Change password", "Change password a user's password, regardless of the current value.");
    this.username = userPath;
    this.password = password;
  }

  @Override
  public void execute(InstallContext installContext) throws TaskExecutionException {
    try {
      Session session = installContext.getJCRSession(RepositoryConstants.USERS);
      Node node = session.getNode(username);
      Property prop = node.getProperty("pswd");
      prop.setValue(SecurityUtil.getBCrypt(password));
      session.save();
    } catch (RepositoryException e) {
      throw new TaskExecutionException("Exception setting password", e);
    }
  }
}
