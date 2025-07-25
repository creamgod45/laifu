package laifu.fu.lai;

import javax.swing.*;
import java.awt.*;

/**
 * A component with a simple service life cycle that can be managed by
 * {@link GuiManager}. Implementations typically provide a Swing UI component
 * returned by {@link #getComponent()} which can be added to a {@link JFrame}.
 */
public interface CGComponent {
    /** States for the component. */
    enum Status { ENABLED, DISABLED, ERROR }

    /** Called when the component should attach itself to the provided frame. */
    void onEnable(JFrame frame);

    /** Called when the component should clean up resources. */
    void onDisable();

    /** Called when the component should reload its state. */
    void onReload();

    /** Called when an error occurred during a lifecycle phase. */
    void onError(Throwable throwable);

    /** Generic event hook. */
    default void on(String event, Object... args) {}

    /**
     * @return the Swing component to add to the frame, or {@code null} if none
     */
    Component getComponent();

    /**
     * @return the current lifecycle status
     */
    Status getStatus();
}
