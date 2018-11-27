package de.neoskop.magnolia;

import org.apache.commons.lang.StringUtils;

public class PaperboyModule {
  private String previewUrl;
  private boolean debugMode = false;
  private WebhookConfig webhookConfig = new WebhookConfig();

  public String getPreviewUrl() {
    final String envPreviewUrl = System.getenv("PREVIEW_URL");

    if (StringUtils.isBlank(envPreviewUrl)) {
      return normalize(previewUrl);
    }

    return normalize(envPreviewUrl);
  }

  private String normalize(String url) {
    return url.replaceAll("/$", "");
  }

  public void setPreviewUrl(String previewUrl) {
    this.previewUrl = previewUrl;
  }

  public boolean isDebugMode() {
    return debugMode;
  }

  public void setDebugMode(boolean debugMode) {
    this.debugMode = debugMode;
  }

  public WebhookConfig getWebhookConfig() {
    return webhookConfig;
  }

  public void setWebhookConfig(WebhookConfig webhookConfig) {
    this.webhookConfig = webhookConfig;
  }
}
