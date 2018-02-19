package edu.lehigh.cse216.mfs409.admin;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Map;

/**
 * App is our basic admin app.  For now, all it does is connect to the database
 * and then disconnect
 */
public class App {
    /**
     * The main routine reads arguments from the environment and then uses those
     * arguments to connect to the database.
     */
    public static void main(String[] argv) {
        // get the Postgres configuration from the environment
        Map<String, String> env = System.getenv();
        String ip = env.get("POSTGRES_IP");
        String port = env.get("POSTGRES_PORT");
        String user = env.get("POSTGRES_USER");
        String pass = env.get("POSTGRES_PASS");

        // Some students find that they need the following lines
        // *before DriverManager.getConnection* in order to get the postgres
        // driver to load

        // try {
        //     Class.forName("org.postgresql.Driver");
        // } catch (ClassNotFoundException cnfe) {
        //     System.out.println("Unable to find postgresql driver");
        //     return;
        // }

        // conn is a connection to the database.  In this simple example, it is
        // a local variable, though in a realistic program it might not be
        Connection conn = null;

        // Connect to the database or fail
        System.out.print("Connecting to " + ip + ":" + port);
        try {
            // Open a connection, fail if we cannot get one
            conn = DriverManager.getConnection("jdbc:postgresql://" + ip + ":" + port + "/", user, pass);
            if (conn == null) {
                System.out.println("\n\tError: DriverManager.getConnection() returned a null object");
                return;
            }
        } catch (SQLException e) {
            System.out.println("\n\tError: DriverManager.getConnection() threw a SQLException");
            e.printStackTrace();
            return;
        }
        System.out.println(" ... successfully connected");

        System.out.print("Disconnecting from database");
        try {
            conn.close();
        } catch (SQLException e) {
            System.out.println("\n\tError: close() threw a SQLException");
            e.printStackTrace();
            return;
        }
        System.out.println(" ...  connection successfully closed");
    }
}
