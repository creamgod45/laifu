package laifu.fu.lai;

import me.friwi.jcefmaven.CefAppBuilder;
import me.friwi.jcefmaven.CefInitializationException;
import me.friwi.jcefmaven.MavenCefAppHandlerAdapter;
import me.friwi.jcefmaven.UnsupportedPlatformException;
import org.cef.CefApp;
import org.cef.CefClient;
import org.cef.browser.CefBrowser;

import javax.swing.*;
import java.awt.*;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class FuDesktopApp {
    private static final Logger LOGGER = Logger.getLogger(FuDesktopApp.class.getName());

    public static void main(String[] args) {
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
            throws UnsupportedPlatformException, CefInitializationException,
            IOException, InterruptedException {
        // Start Spring Boot server
        org.springframework.boot.SpringApplication.run(FuApplication.class, args);

        // Configure and start JCEF
        CefAppBuilder builder = new CefAppBuilder();
        builder.setInstallDir(new File("jcef-bundle"));
        builder.setAppHandler(new MavenCefAppHandlerAdapter() {});
        CefApp cefApp = builder.build();
        CefClient client = cefApp.createClient();
        CefBrowser browser = client.createBrowser("http://localhost:8080", false, false);
        Component browserUI = browser.getUIComponent();

        JFrame frame = new JFrame("Fu Desktop App");
        frame.getContentPane().add(browserUI, BorderLayout.CENTER);
        frame.setSize(1024, 768);
        frame.setLocationRelativeTo(null);
        frame.addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                CefApp.getInstance().dispose();
                frame.dispose();
                System.exit(0);
            }
        });
        frame.setVisible(true);
    }
}
