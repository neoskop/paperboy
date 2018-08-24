package de.neoskop.magnolia.command;

import de.neoskop.magnolia.model.Change;
import de.neoskop.magnolia.service.ChangeAnnouncementService;
import info.magnolia.commands.MgnlCommand;
import info.magnolia.context.Context;
import info.magnolia.objectfactory.Components;
import org.apache.commons.lang.StringUtils;

public class SendChangeCommand extends MgnlCommand {
  @Override
  public boolean execute(Context context) throws Exception {
    final String workspace = (String) context.get("workspace");
    final Change change = new Change(StringUtils.isBlank(workspace) ? "website" : workspace);
    return Components.getComponent(ChangeAnnouncementService.class).announce(change);
  }
}
