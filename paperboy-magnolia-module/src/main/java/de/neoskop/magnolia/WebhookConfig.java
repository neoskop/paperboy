package de.neoskop.magnolia;

import okhttp3.Credentials;
import okhttp3.Request;
import org.apache.commons.lang.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class WebhookConfig {
  public static final String ENV_PREFIX = PaperboyModule.GLOBAL_ENV_PREFIX + "WEBHOOK_";
  private String url;
  private WebhookAuthorization authorization = WebhookAuthorization.NONE;
  private String bearerToken;
  private String username;
  private String password;
  private static final Logger LOG = LogManager.getLogger(WebhookConfig.class);

  public WebhookConfig() {}

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  public WebhookAuthorization getAuthorization() {
    return authorization;
  }

  public void setAuthorization(WebhookAuthorization authorization) {
    this.authorization = authorization;
  }

  public String getBearerToken() {
    return bearerToken;
  }

  public void setBearerToken(String bearerToken) {
    this.bearerToken = bearerToken;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Request.Builder prepareRequest() {
    final Request.Builder builder = new Request.Builder().url(getValueFromEnv(url, "URL"));

    switch (getAuthorizationFromEnv()) {
      case BASIC_AUTH:
        addBasicAuth(builder);
        break;
      case BEARER_TOKEN:
        addBearerToken(builder);
        break;
    }

    return builder;
  }

  private void addBearerToken(Request.Builder builder) {
    final String bearerToken = getValueFromEnv(this.bearerToken, "BEARER_TOKEN");

    if (StringUtils.isNotBlank(bearerToken)) {
      builder.addHeader("Authorization", "Bearer " + bearerToken);
    }
  }

  private void addBasicAuth(Request.Builder builder) {
    final String username = getValueFromEnv(this.username, "USERNAME");
    final String password = getValueFromEnv(this.password, "PASSWORD");

    if (StringUtils.isNotBlank(username) && StringUtils.isNotBlank(password)) {
      final String credentials = Credentials.basic(username, password);
      builder.addHeader("Authorization", credentials);
    }
  }

  public String getValueFromEnv(String fallbackValue, String variableName) {
    final String envValue = System.getenv(ENV_PREFIX + variableName);
    return StringUtils.isBlank(envValue) ? fallbackValue : envValue;
  }

  public WebhookAuthorization getAuthorizationFromEnv() {
    final String envValue = System.getenv(ENV_PREFIX + "AUTHORIZATION");
    try {
      return StringUtils.isBlank(envValue) ? authorization : WebhookAuthorization.valueOf(envValue);
    } catch (IllegalArgumentException e) {
      LOG.error("Value in " + ENV_PREFIX + "AUTHORIZATION (" + envValue + ") is invalid", e);
      return authorization;
    }
  }
}
