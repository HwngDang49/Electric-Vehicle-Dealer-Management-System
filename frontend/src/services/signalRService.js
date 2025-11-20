import * as signalR from "@microsoft/signalr";
import authService from "./AuthService";

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.isConnecting = false; // Track if connection is in progress
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 seconds
    this.currentDealerId = null;
    this.onVinAvailableCallback = null;
    this.onVinsReceivedCallback = null;
  }

  /**
   * Initialize and start SignalR connection
   * @param {string} dealerId - Dealer ID to join the group
   * @param {Function} onVinAvailable - Callback when VIN becomes available
   * @param {Function} onVinsReceived - Callback when VINs are received
   */
  async startConnection(dealerId, onVinAvailable, onVinsReceived) {
    // Store callbacks
    this.onVinAvailableCallback = onVinAvailable;
    this.onVinsReceivedCallback = onVinsReceived;
    this.currentDealerId = dealerId;

    // If already connected to the same dealer, just update callbacks and return
    if (this.connection && this.isConnected && this.currentDealerId === dealerId) {
      console.log("SignalR already connected, updating callbacks");
      // Update callbacks if connection exists
      if (onVinAvailable) {
        this.connection.off("VinAvailable");
        this.connection.on("VinAvailable", (data) => {
          console.log("VinAvailable event received:", data);
          onVinAvailable(data);
        });
      }
      if (onVinsReceived) {
        this.connection.off("VinsReceived");
        this.connection.on("VinsReceived", (data) => {
          console.log("VinsReceived event received:", data);
          onVinsReceived(data);
        });
      }
      return;
    }

    // If already connecting, wait for it to complete
    if (this.isConnecting) {
      console.log("SignalR connection already in progress, waiting...");
      // Wait for connection to complete (max 10 seconds)
      let waitCount = 0;
      while (this.isConnecting && waitCount < 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        waitCount++;
      }
      if (this.isConnected) {
        // Update callbacks after connection
        if (onVinAvailable) {
          this.connection.off("VinAvailable");
          this.connection.on("VinAvailable", (data) => {
            console.log("VinAvailable event received:", data);
            onVinAvailable(data);
          });
        }
        if (onVinsReceived) {
          this.connection.off("VinsReceived");
          this.connection.on("VinsReceived", (data) => {
            console.log("VinsReceived event received:", data);
            onVinsReceived(data);
          });
        }
        return;
      }
    }

    // If connection exists but not connected, stop it first
    if (this.connection) {
      try {
        this.isConnecting = false;
        await this.connection.stop();
      } catch (error) {
        console.warn("Error stopping existing connection:", error);
      }
      this.connection = null;
      this.isConnected = false;
    }

    // Set connecting flag
    this.isConnecting = true;

    try {
      const token = authService.getToken();
      if (!token) {
        console.warn("No auth token found, cannot connect to SignalR");
        return;
      }

      // Get base URL - remove /api suffix if present for SignalR
      let baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5014";
      // Remove /api suffix if it exists (SignalR needs base URL)
      if (baseUrl.endsWith("/api")) {
        baseUrl = baseUrl.slice(0, -4);
      }
      const hubUrl = `${baseUrl}/api/notificationHub`;

      // Create connection
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
          withCredentials: true,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
              return this.reconnectDelay;
            }
            return null; // Stop reconnecting
          },
        })
        .configureLogging(signalR.LogLevel.Warning) // Reduce log noise
        .build();

      // Register event handlers
      this.connection.on("VinAvailable", (data) => {
        console.log("VinAvailable event received:", data);
        if (onVinAvailable) {
          onVinAvailable(data);
        }
      });

      this.connection.on("VinsReceived", (data) => {
        console.log("VinsReceived event received:", data);
        if (onVinsReceived) {
          onVinsReceived(data);
        }
      });

      // Connection event handlers
      this.connection.onclose((error) => {
        console.log("SignalR connection closed", error);
        this.isConnected = false;
        this.reconnectAttempts++;
      });

      this.connection.onreconnecting((error) => {
        console.log("SignalR reconnecting...", error);
        this.isConnected = false;
      });

      this.connection.onreconnected((connectionId) => {
        console.log("SignalR reconnected:", connectionId);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        // Rejoin dealer group after reconnection
        if (dealerId) {
          this.joinDealerGroup(dealerId);
        }
      });

      // Start connection
      await this.connection.start();
      console.log("SignalR connected successfully");

      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      // Join dealer group
      if (dealerId) {
        await this.joinDealerGroup(dealerId);
      }
    } catch (error) {
      console.error("Error starting SignalR connection:", error);
      this.isConnected = false;
      this.isConnecting = false;
      
      // Only retry if it's not an abort error (user-initiated stop)
      if (error.name !== "AbortError" && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          if (!this.isConnecting && !this.isConnected) {
            this.startConnection(dealerId, onVinAvailable, onVinsReceived);
          }
        }, this.reconnectDelay);
      }
    }
  }

  /**
   * Join dealer group
   */
  async joinDealerGroup(dealerId) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke("JoinDealerGroup", dealerId.toString());
        console.log(`Joined dealer group: dealer-${dealerId}`);
      } catch (error) {
        console.error("Error joining dealer group:", error);
      }
    }
  }

  /**
   * Leave dealer group
   */
  async leaveDealerGroup(dealerId) {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke("LeaveDealerGroup", dealerId.toString());
        console.log(`Left dealer group: dealer-${dealerId}`);
      } catch (error) {
        console.error("Error leaving dealer group:", error);
      }
    }
  }

  /**
   * Stop SignalR connection
   */
  async stopConnection() {
    this.isConnecting = false;
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("SignalR connection stopped");
      } catch (error) {
        console.error("Error stopping SignalR connection:", error);
      } finally {
        this.connection = null;
        this.isConnected = false;
        this.currentDealerId = null;
        this.onVinAvailableCallback = null;
        this.onVinsReceivedCallback = null;
      }
    }
  }

  /**
   * Get connection state
   */
  getConnectionState() {
    if (!this.connection) return signalR.HubConnectionState.Disconnected;
    return this.connection.state;
  }
}

// Export singleton instance
const signalRService = new SignalRService();
export default signalRService;
