package merhoo.backend;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.net.URI;
import java.net.URISyntaxException;

import java.util.ArrayList;
import java.util.Map;

public class Database {
    /**
     * The rows of data in our DataStore
     */
    private ArrayList<DataRow> mRows;

    /**
     * A counter for keeping track of the next ID to assign to a new row
     */
    private int mCounter;
    /**
     * The connection to the database.  When there is no connection, it should
     * be null.  Otherwise, there is a valid open connection
     */
    private Connection mConnection;

    /**
     * A prepared statement for getting all data in the database
     */
    private PreparedStatement mSelectAll;

    /**
     * A prepared statement for getting one row from the database
     */
    private PreparedStatement mSelectOne;

    /**
     * A prepared statement for deleting a row from the database
     */
    private PreparedStatement mDeleteOne;

    /**
     * A prepared statement for inserting into the database
     */
    private PreparedStatement mInsertOne;

    /**
     * A prepared statement for updating a single row in the database
     */
    private PreparedStatement mUpdateOne;

    /**
     * A prepared statement for creating the table in our database
     */
    private PreparedStatement mCreateTable;

    /**
     * A prepared statement for dropping the table in our database
     */
    private PreparedStatement mDropTable;

    /**
     * RowData is like a struct in C: we use it to hold data, and we allow
     * direct access to its fields.  In the context of this Database, RowData
     * represents the data we'd see in a row.
     *
     * We make RowData a static class of Database because we don't really want
     * to encourage users to think of RowData as being anything other than an
     * abstract representation of a row of the database.  RowData and the
     * Database are tightly coupled: if one changes, the other should too.
     */
    public static class RowData {
        /**
         * The ID of this row of the database
         */
        int mId;
        /**
         * The subject stored in this row
         */
        String mSubject;
        /**
         * The message stored in this row
         */
        String mMessage;

        /**
         * Construct a RowData object by providing values for its fields
         */
        public RowData(int id, String subject, String message) {
            mId = id;
            mSubject = subject;
            mMessage = message;
        }
    }

    /**
     * The Database constructor is private: we only create Database objects
     * through the getDatabase() method.
     */
    private Database() {
      mCounter = 0;
      mRows = new ArrayList<>();
    }

    /**
     * Get a fully-configured connection to the database
     *
     * @param ip   The IP address of the database server
     * @param port The port on the database server to which connection requests
     *             should be sent
     * @param user The user ID to use when connecting
     * @param pass The password to use when connecting
     *
     * @return A Database object, or null if we cannot connect properly
     */
    static Database getDatabase() {
        // Create an un-configured Database object
        Database db = new Database();
        Map<String, String> env = System.getenv();
        String db_url = env.get("DATABASE_URL");

        // Give the Database object a connection, fail if we cannot get one
        try {
            Class.forName("org.postgresql.Driver");
            URI dbUri = new URI(db_url);
            String username = dbUri.getUserInfo().split(":")[0];
            String password = dbUri.getUserInfo().split(":")[1];
            String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();
            Connection conn = DriverManager.getConnection(dbUrl, username, password);
            if (conn == null) {
                System.err.println("Error: DriverManager.getConnection() returned a null object");
                return null;
            }
            db.mConnection = conn;
        } catch (SQLException e) {
            System.err.println("Error: DriverManager.getConnection() threw a SQLException");
            e.printStackTrace();
            return null;
        } catch (ClassNotFoundException cnfe) {
            System.out.println("Unable to find postgresql driver");
            return null;
        } catch (URISyntaxException s) {
            System.out.println("URI Syntax Error");
            return null;
        }

        // Attempt to create all of our prepared statements.  If any of these
        // fail, the whole getDatabase() call should fail
        try {
            // NB: we can easily get ourselves in trouble here by typing the
            //     SQL incorrectly.  We really should have things like "tblData"
            //     as constants, and then build the strings for the statements
            //     from those constants.

            // Note: no "IF NOT EXISTS" or "IF EXISTS" checks on table
            // creation/deletion, so multiple executions will cause an exception
            db.mCreateTable = db.mConnection.prepareStatement(
                    "CREATE TABLE tblData (id SERIAL PRIMARY KEY, subject VARCHAR(50) "
                    + "NOT NULL, message VARCHAR(500) NOT NULL)");
            db.mDropTable = db.mConnection.prepareStatement("DROP TABLE tblData");

            // Standard CRUD operations
            db.mDeleteOne = db.mConnection.prepareStatement("DELETE FROM tblData WHERE id = ?");
            db.mInsertOne = db.mConnection.prepareStatement("INSERT INTO tblData VALUES (default, ?, ?)");
            db.mSelectAll = db.mConnection.prepareStatement("SELECT id, subject FROM tblData");
            db.mSelectOne = db.mConnection.prepareStatement("SELECT * from tblData WHERE id=?");
            db.mUpdateOne = db.mConnection.prepareStatement("UPDATE tblData SET message = ? WHERE id = ?");
        } catch (SQLException e) {
            System.err.println("Error creating prepared statement");
            e.printStackTrace();
            db.disconnect();
            return null;
        }
        return db;
    }

    /**
     * Close the current connection to the database, if one exists.
     *
     * NB: The connection will always be null after this call, even if an
     *     error occurred during the closing operation.
     *
     * @return True if the connection was cleanly closed, false otherwise
     */
    boolean disconnect() {
        if (mConnection == null) {
            System.err.println("Unable to close connection: Connection was null");
            return false;
        }
        try {
            mConnection.close();
        } catch (SQLException e) {
            System.err.println("Error: Connection.close() threw a SQLException");
            e.printStackTrace();
            mConnection = null;
            return false;
        }
        mConnection = null;
        return true;
    }

    /**
     * Insert a row into the database
     *
     * @param subject The subject for this new row
     * @param message The message body for this new row
     *
     * @return The number of rows that were inserted
     */
    int insertRow(String subject, String message) {
        int count = 0;
        try {
            mInsertOne.setString(1, subject);
            mInsertOne.setString(2, message);
            count += mInsertOne.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return count;
    }

    /**
     * Query the database for a list of all subjects and their IDs
     *
     * @return All rows, as an ArrayList
     */
    ArrayList<RowData> selectAll() {
        ArrayList<RowData> res = new ArrayList<RowData>();
        try {
            ResultSet rs = mSelectAll.executeQuery();
            while (rs.next()) {
                res.add(new RowData(rs.getInt("id"), rs.getString("subject"), null));
            }
            rs.close();
            return res;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Get one complete row from the DataStore using its ID to select it
     *
     * @param id The id of the row to select
     * @return A copy of the data in the row, if it exists, or null otherwise
     */
    public synchronized DataRow readOne(int id) {
        if (id >= mRows.size())
            return null;
        DataRow data = mRows.get(id);
        if (data == null)
            return null;
        return new DataRow(data);
    }

    /**
     * Get all of the ids and titles that are present in the DataStore
     * @return An ArrayList with all of the data
     */
    public synchronized ArrayList<DataRowLite> readAll() {
        ArrayList<DataRowLite> data = new ArrayList<>();
        // NB: we copy the data, so that our ArrayList only has ids and titles
        for (DataRow row : mRows) {
            if (row != null)
                data.add(new DataRowLite(row));
        }
        return data;
    }

    /**
     * Get all data for a specific row, by ID
     *
     * @param id The id of the row being requested
     *
     * @return The data for the requested row, or null if the ID was invalid
     */
    RowData selectOne(int id) {
        RowData res = null;
        try {
            mSelectOne.setInt(1, id);
            ResultSet rs = mSelectOne.executeQuery();
            if (rs.next()) {
                res = new RowData(rs.getInt("id"), rs.getString("subject"), rs.getString("message"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return res;
    }

    /**
     * Delete a row by ID
     *
     * @param id The id of the row to delete
     *
     * @return The number of rows that were deleted.  -1 indicates an error.
     */
    int deleteRow(int id) {
        int res = -1;
        try {
            mDeleteOne.setInt(1, id);
            res = mDeleteOne.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return res;
    }

    /**
     * Update the title and content of a row in the DataStore
     *
     * @param id The Id of the row to update
     * @param title The new title for the row
     * @param content The new content for the row
     * @return a copy of the data in the row, if it exists, or null otherwise
     */
    public synchronized DataRow updateOne(int id, String title, String content) {
        // Do not update if we don't have valid data
        if (title == null || content == null)
            return null;
        // Only update if the current entry is valid (not null)
        if (id >= mRows.size())
            return null;
        DataRow data = mRows.get(id);
        if (data == null)
            return null;
        // Update and then return a copy of the data, as a DataRow
        data.mTitle = title;
        data.mContent = content;
        return new DataRow(data);
    }

    /**
     * Add a new row to the DataStore
     *
     * Note: we return -1 on an error.  There are many good ways to handle an
     * error, to include throwing an exception.  In robust code, returning -1
     * may not be the most appropriate technique, but it is sufficient for this
     * tutorial.
     *
     * @param title The title for this newly added row
     * @param content The content for this row
     * @return the ID of the new row, or -1 if no row was created
     */
    public synchronized int createEntry(String title, String content) {
        if (title == null || content == null)
            return -1;
        // NB: we can safely assume that id is greater than the largest index in
        //     mRows, and thus we can use the index-based add() method
        int id = mCounter++;
        DataRow data = new DataRow(id, title, content);
        mRows.add(id, data);
        return id;
    }

    /**
     * Create tblData.  If it already exists, this will print an error
     */
    void createTable() {
        try {
            mCreateTable.execute();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * Remove tblData from the database.  If it does not exist, this will print
     * an error.
     */
    void dropTable() {
        try {
            mDropTable.execute();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * Delete a row from the DataStore
     *
     * @param id The Id of the row to delete
     * @return true if the row was deleted, false otherwise
     */
    public synchronized boolean deleteOne(int id) {
        // Deletion fails for an invalid Id or an Id that has already been
        // deleted
        if (id >= mRows.size())
            return false;
        if (mRows.get(id) == null)
            return false;
        // Delete by setting to null, so that any Ids used by other clients
        // still refer to the same positions in the ArrayList.
        mRows.set(id, null);
        return true;
    }
}
