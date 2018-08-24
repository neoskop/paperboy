package de.neoskop.magnolia;

import org.apache.commons.lang.StringUtils;

/**
 * This class is optional and represents the configuration for the paperboy module. By exposing
 * simple getter/setter/adder methods, this bean can be configured via content2bean using the
 * properties and node from <tt>config:/modules/paperboy</tt>. If you don't need this, simply remove
 * the reference to this class in the module descriptor xml.
 */
public class PaperboyModule {
  private String queueUri;
  private String previewUrl;
  private boolean debugMode;

  public String getQueueUri() {
    final String envQueueUri = System.getenv("QUEUE_URI");

    if (StringUtils.isBlank(envQueueUri)) {
      return queueUri;
    }

    return envQueueUri;
  }

  public void setQueueUri(String queueUri) {
    this.queueUri = queueUri;
  }

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
}
