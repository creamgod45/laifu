package laifu.fu.lai;

import org.cef.CefApp;
import org.cef.browser.CefBrowser;

import javax.swing.*;
import java.awt.*;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;

/**
 * Simple utility class that wraps the JFrame creation logic for the
 * embedded JCEF browser. It is responsible for displaying the browser
 * component and shutting down the CEF runtime when the window is closed.
 */
public class GuiManager {
    private JFrame frame;

    /**
     * Display the provided {@link CefBrowser} in a new application window.
     *
     * @param browser the browser instance whose UI should be shown
     */
    public void showBrowser(CefBrowser browser) {
        Component browserUI = browser.getUIComponent();

        frame = new JFrame("Fu Desktop App");
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
