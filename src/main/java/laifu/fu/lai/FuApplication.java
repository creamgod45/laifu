package laifu.fu.lai;

import me.friwi.jcefmaven.CefInitializationException;
import me.friwi.jcefmaven.UnsupportedPlatformException;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

@SpringBootApplication
public class FuApplication {
	private static final Logger LOGGER = Logger.getLogger(FuApplication.class.getName());

	public static void main(String[] args)
	{
		try {
			start(args);
		} catch (UnsupportedPlatformException | CefInitializationException e) {
			LOGGER.log(Level.SEVERE, "Failed to initialize platform", e);
			System.err.println("This platform is not supported or CEF failed to initialize.");
		} catch (IOException e) {
			LOGGER.log(Level.SEVERE, "I/O error", e);
			System.err.println("An I/O error occurred: " + e.getMessage());
		} catch (InterruptedException e) {
			LOGGER.log(Level.SEVERE, "Application interrupted", e);
			Thread.currentThread().interrupt();
			System.err.println("Application startup was interrupted.");
		}
	}

	private static void start(String[] args)
			throws UnsupportedPlatformException, CefInitializationException, IOException, InterruptedException {

		new SpringApplicationBuilder(FuApplication.class)
				.headless(false)
				.run(args);

		LOGGER.info("Application started.");
	}
}
