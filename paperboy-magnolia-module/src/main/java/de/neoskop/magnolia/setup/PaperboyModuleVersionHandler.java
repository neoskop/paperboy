package de.neoskop.magnolia.setup;

import static info.magnolia.repository.RepositoryConstants.CONFIG;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.lang3.StringUtils;

import de.neoskop.magnolia.PaperboyModule;
import de.neoskop.magnolia.task.ChangePasswordTask;
import info.magnolia.module.DefaultModuleVersionHandler;
import info.magnolia.module.InstallContext;
import info.magnolia.module.delta.DeltaBuilder;
import info.magnolia.module.delta.ModuleBootstrapTask;
import info.magnolia.module.delta.SamplesBootstrapTask;
import info.magnolia.module.delta.SetPropertyTask;
import info.magnolia.module.delta.Task;

/**
 * This class is optional and lets you manage the versions of your module, by registering "deltas"
 * to maintain the module's configuration, or other type of content. If you don't need this, simply
 * remove the reference to this class in the module descriptor xml.
 *
 * @see info.magnolia.module.DefaultModuleVersionHandler
 * @see info.magnolia.module.ModuleVersionHandler
 * @see info.magnolia.module.delta.Task
 */
public class PaperboyModuleVersionHandler extends DefaultModuleVersionHandler {
  public PaperboyModuleVersionHandler() {
    register(
        DeltaBuilder.update("0.5.2", "")
            .addTask(new ModuleBootstrapTask())
            .addTask(new SamplesBootstrapTask())
            .addTasks(getSetupPreviewTasks()));
  }

  private static List<Task> getSetupPreviewTasks() {
    return Arrays.asList(
        new SetPropertyTask(
            CONFIG,
            "/modules/pages/apps/pages/subApps/browser/actions/preview",
            "class",
            "de.neoskop.magnolia.action.definition.PreviewPageActionDefinition"),
        new SetPropertyTask(
            CONFIG,
            "/modules/pages/apps/pages/subApps/detail/actions/preview",
            "class",
            "de.neoskop.magnolia.action.definition.PreviewPageActionDefinition"),
        new SetPropertyTask(
            CONFIG,
            "/modules/pages/apps/pages/subApps/detail/pageBar/extensions/nativePagePreviewLink",
            "extensionClass",
            "de.neoskop.magnolia.extension.NativePagePreviewLink"));
  }

  private static List<Task> getWriteConfigViaEnvironmentTasks() {
    List<Task> tasks = new ArrayList<>();

    String userPassword = System.getenv(PaperboyModule.GLOBAL_ENV_PREFIX + "USER_PASSWORD");

    if (StringUtils.isNotBlank(userPassword)) {
      tasks.add(new ChangePasswordTask("/admin/paperboy", userPassword));
    }

    return tasks;
  }

  @Override
  protected List<Task> getExtraInstallTasks(InstallContext installContext) {
    return getSetupPreviewTasks();
  }

  @Override
  protected List<Task> getStartupTasks(InstallContext installContext) {
    return Stream.concat(
            getSetupPreviewTasks().stream(), getWriteConfigViaEnvironmentTasks().stream())
        .collect(Collectors.toList());
  }
}
