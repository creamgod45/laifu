package laifu.fu.lai;

import org.cef.CefApp;

import javax.swing.*;
import java.awt.*;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.util.ArrayList;
import java.util.List;

/**
 * Simple utility class that wraps the JFrame creation logic for the
 * embedded JCEF browser. It is responsible for displaying the browser
 * component and shutting down the CEF runtime when the window is closed.
 */
public class GuiManager {
    private JFrame frame;
    private final List<CGComponent> handlers = new ArrayList<>();

    /** Register a component to be managed. */
    public GuiManager register(CGComponent component) {
        handlers.add(component);
        return this;
    }

    /** Display the window and enable all registered components. */
    public void show() {
        frame = new JFrame("Fu Desktop App");
        frame.setSize(1024, 768);
        frame.setLocationRelativeTo(null);

        for (CGComponent handler : handlers) {
            try {
                handler.onEnable(frame);
                Component ui = handler.getComponent();
                if (ui != null) {
                    frame.getContentPane().add(ui);
                }
            } catch (Exception ex) {
                handler.onError(ex);
            }
        }

        frame.addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                for (CGComponent handler : handlers) {
                    try {
                        handler.onDisable();
                    } catch (Exception ex) {
                        handler.onError(ex);
                    }
                }
                CefApp.getInstance().dispose();
                frame.dispose();
                System.exit(0);
            }
        });

        frame.setVisible(true);
    }

    /** Reload all registered components. */
    public void reload() {
        for (CGComponent handler : handlers) {
            try {
                handler.onReload();
            } catch (Exception ex) {
                handler.onError(ex);
            }
        }
    }
}
