package de.neoskop.magnolia.service;

import com.rabbitmq.client.AMQP.BasicProperties;
import com.rabbitmq.client.AMQP.BasicProperties.Builder;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import de.neoskop.magnolia.PaperboyModule;
import de.neoskop.magnolia.model.Change;
import info.magnolia.cms.beans.config.ServerConfiguration;
import info.magnolia.objectfactory.Components;
import java.io.IOException;
import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.concurrent.TimeoutException;
import javax.inject.Inject;
import javax.inject.Singleton;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * @author Arne Diekmann
 * @since 18.12.17
 */
@Singleton
public class ChangeAnnouncementService {
  private static final String EXCHANGE_NAME = "paperboy";
  private static final String PREVIEW_EXCHANGE_NAME = "paperboy_preview";
  private static final Logger LOG = LogManager.getLogger(ChangeAnnouncementService.class);
  private final PaperboyModule module;
  private Connection connection;
  private Channel channel;

  @Inject
  public ChangeAnnouncementService(PaperboyModule module) {
    this.module = module;
  }

  public boolean announce(final Change change) {
    if (connection == null || !connection.isOpen()) {
      try {
        connectToQueue();
      } catch (IOException
          | NoSuchAlgorithmException
          | TimeoutException
          | URISyntaxException
          | KeyManagementException e) {
        LOG.error("Could not connect to queue", e);
        return false;
      }
    }

    byte[] messageBodyBytes = change.toJson().getBytes();

    try {
      final BasicProperties properties =
          new Builder()
              .expiration("10000")
              .timestamp(new Date())
              .contentType("application/json")
              .build();
      channel.basicPublish(getExchange(), "", properties, messageBodyBytes);

      if (module.isDebugMode()) {
        LOG.info("Sent the following message: " + change.toJson());
      }
    } catch (IOException e) {
      LOG.error("Could not announce change in queue", e);
      return false;
    }

    return true;
  }

  private String getExchange() {
    return Components.getComponent(ServerConfiguration.class).isAdmin()
        ? PREVIEW_EXCHANGE_NAME
        : EXCHANGE_NAME;
  }

  private void connectToQueue()
      throws NoSuchAlgorithmException, KeyManagementException, URISyntaxException, IOException,
          TimeoutException {
    ConnectionFactory factory = new ConnectionFactory();
    factory.setUri(module.getQueueUri());
    connection = factory.newConnection();
    channel = connection.createChannel();
    channel.exchangeDeclare(getExchange(), "fanout");
    channel.addShutdownListener(
        cause -> {
          try {
            if (module.isDebugMode()) {
              LOG.info(
                  "The channel was unexpectedly closed: "
                      + cause.getMessage()
                      + ". Reconnecting...");
            }

            this.connectToQueue();
          } catch (NoSuchAlgorithmException
              | TimeoutException
              | IOException
              | URISyntaxException
              | KeyManagementException e) {
            LOG.error("Could not reconnect after the channel was unexpectedly closed");
          }
        });
  }
}
