import * as signalR from "@microsoft/signalr";
import authService from "./AuthService";

class EvmStaffSignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.onNewPurchaseOrderCallback = null;
    this.onNewClaimCallback = null;
    this.callbacks = [];
    this.claimCallbacks = [];
  }

  /**
   * Initialize and start SignalR connection for EVM Staff
   * @param {Function} onNewPurchaseOrder - Callback when new PO is submitted
   * @param {Function} onNewClaim - Callback when new claim is created
   */
  async startConnection(onNewPurchaseOrder, onNewClaim) {
    this.onNewPurchaseOrderCallback = onNewPurchaseOrder;
    this.onNewClaimCallback = onNewClaim;

    // If already connected, just update callbacks and return
    if (this.connection && this.isConnected) {
      console.log("EVM Staff SignalR already connected, updating callbacks");
      if (onNewPurchaseOrder) {
        this.connection.off("NewPurchaseOrder");
        this.connection.on("NewPurchaseOrder", (data) => {
          console.log("NewPurchaseOrder event received:", data);
          // Call the main callback
          if (onNewPurchaseOrder && typeof onNewPurchaseOrder === 'function') {
            try {
              onNewPurchaseOrder(data);
            } catch (error) {
              console.error("Error in main notification callback:", error);
            }
          }
          // Call all registered callbacks
          this.callbacks.forEach(callback => {
            if (typeof callback === 'function') {
              try {
                callback(data);
              } catch (error) {
                console.error("Error in notification callback:", error);
              }
            }
          });
        });
      }
      if (onNewClaim) {
        this.connection.off("NewClaim");
        this.connection.on("NewClaim", (data) => {
          console.log("NewClaim event received:", data);
          // Call the main callback
          if (onNewClaim && typeof onNewClaim === 'function') {
            try {
              onNewClaim(data);
            } catch (error) {
              console.error("Error in main claim callback:", error);
            }
          }
          // Call all registered callbacks
          this.claimCallbacks.forEach(callback => {
            if (typeof callback === 'function') {
              try {
                callback(data);
              } catch (error) {
                console.error("Error in claim callback:", error);
              }
            }
          });
        });
      }
      return;
    }

    // If already connecting, wait for it to complete
    if (this.isConnecting) {
      console.log("EVM Staff SignalR connection already in progress, waiting...");
      let waitCount = 0;
      while (this.isConnecting && waitCount < 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        waitCount++;
      }
      if (this.isConnected) {
        if (onNewPurchaseOrder) {
          this.connection.off("NewPurchaseOrder");
          this.connection.on("NewPurchaseOrder", (data) => {
            console.log("NewPurchaseOrder event received:", data);
            // Call the main callback
            if (onNewPurchaseOrder && typeof onNewPurchaseOrder === 'function') {
              try {
                onNewPurchaseOrder(data);
              } catch (error) {
                console.error("Error in main notification callback:", error);
              }
            }
            // Call all registered callbacks
            this.callbacks.forEach(callback => {
              if (typeof callback === 'function') {
                try {
                  callback(data);
                } catch (error) {
                  console.error("Error in notification callback:", error);
                }
              }
            });
          });
        }
        if (onNewClaim) {
          this.connection.off("NewClaim");
          this.connection.on("NewClaim", (data) => {
            console.log("NewClaim event received:", data);
            // Call the main callback
            if (onNewClaim && typeof onNewClaim === 'function') {
              try {
                onNewClaim(data);
              } catch (error) {
                console.error("Error in main claim callback:", error);
              }
            }
            // Call all registered callbacks
            this.claimCallbacks.forEach(callback => {
              if (typeof callback === 'function') {
                try {
                  callback(data);
                } catch (error) {
                  console.error("Error in claim callback:", error);
                }
              }
            });
          });
        }
      }
      return;
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

    this.isConnecting = true;

    try {
      const token = authService.getToken();
      if (!token) {
        console.warn("No auth token found, cannot connect to SignalR");
        return;
      }

      // Get base URL
      let baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5014";
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
            return null;
          },
        })
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // Register event handler for NewPurchaseOrder
      this.connection.on("NewPurchaseOrder", (data) => {
        console.log("NewPurchaseOrder event received:", data);
        // Call the main callback first
        if (onNewPurchaseOrder && typeof onNewPurchaseOrder === 'function') {
          try {
            onNewPurchaseOrder(data);
          } catch (error) {
            console.error("Error in main notification callback:", error);
          }
        }
        // Then call all registered callbacks
        this.callbacks.forEach(callback => {
          if (typeof callback === 'function') {
            try {
              callback(data);
            } catch (error) {
              console.error("Error in notification callback:", error);
            }
          }
        });
      });

      // Register event handler for NewClaim
      this.connection.on("NewClaim", (data) => {
        console.log("EVM Staff SignalR: NewClaim event received:", data);
        console.log("EVM Staff SignalR: claimCallbacks count:", this.claimCallbacks.length);
        // Call the main callback first
        if (onNewClaim && typeof onNewClaim === 'function') {
          try {
            console.log("EVM Staff SignalR: Calling main claim callback");
            onNewClaim(data);
          } catch (error) {
            console.error("Error in main claim callback:", error);
          }
        }
        // Then call all registered callbacks
        this.claimCallbacks.forEach((callback, index) => {
          if (typeof callback === 'function') {
            try {
              console.log(`EVM Staff SignalR: Calling claim callback ${index}`);
              callback(data);
            } catch (error) {
              console.error(`Error in claim callback ${index}:`, error);
            }
          }
        });
      });

      // Connection event handlers
      this.connection.onclose((error) => {
        console.log("EVM Staff SignalR connection closed", error);
        this.isConnected = false;
        this.reconnectAttempts++;
      });

      this.connection.onreconnecting((error) => {
        console.log("EVM Staff SignalR reconnecting...", error);
        this.isConnected = false;
      });

      this.connection.onreconnected((connectionId) => {
        console.log("EVM Staff SignalR reconnected:", connectionId);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.joinEvmGroup();
      });

      // Start connection
      await this.connection.start();
      console.log("EVM Staff SignalR connected successfully");

      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      // Join EVM Staff group
      await this.joinEvmGroup();
    } catch (error) {
      console.error("Error starting EVM Staff SignalR connection:", error);
      this.isConnected = false;
      this.isConnecting = false;
      
      if (error.name !== "AbortError" && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          if (!this.isConnecting && !this.isConnected) {
            this.startConnection(onNewPurchaseOrder, onNewClaim);
          }
        }, this.reconnectDelay);
      }
    }
  }

  /**
   * Join EVM Staff group
   */
  async joinEvmGroup() {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke("JoinEvmGroup");
        console.log("Joined EVM Staff group");
      } catch (error) {
        console.error("Error joining EVM Staff group:", error);
      }
    }
  }

  /**
   * Leave EVM Staff group
   */
  async leaveEvmGroup() {
    if (this.connection && this.isConnected) {
      try {
        await this.connection.invoke("LeaveEvmGroup");
        console.log("Left EVM Staff group");
      } catch (error) {
        console.error("Error leaving EVM Staff group:", error);
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
        await this.leaveEvmGroup();
        await this.connection.stop();
        console.log("EVM Staff SignalR connection stopped");
      } catch (error) {
        console.error("Error stopping EVM Staff SignalR connection:", error);
      } finally {
        this.connection = null;
        this.isConnected = false;
        this.onNewPurchaseOrderCallback = null;
        this.onNewClaimCallback = null;
        this.callbacks = [];
        this.claimCallbacks = [];
      }
    }
  }

  /**
   * Register a callback for NewPurchaseOrder events
   */
  registerCallback(callback) {
    if (typeof callback === 'function' && !this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
      console.log("Registered notification callback, total callbacks:", this.callbacks.length);
    }
  }

  /**
   * Unregister a callback for NewPurchaseOrder
   */
  unregisterCallback(callback) {
    const beforeLength = this.callbacks.length;
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
    if (this.callbacks.length < beforeLength) {
      console.log("Unregistered notification callback, remaining callbacks:", this.callbacks.length);
    }
  }

  /**
   * Register a callback for NewClaim events
   */
  registerClaimCallback(callback) {
    if (typeof callback === 'function' && !this.claimCallbacks.includes(callback)) {
      this.claimCallbacks.push(callback);
      console.log("EVM Staff: Registered claim callback, total callbacks:", this.claimCallbacks.length);
    } else {
      console.log("EVM Staff: Failed to register claim callback - already exists or not a function");
    }
  }

  /**
   * Unregister a callback for NewClaim
   */
  unregisterClaimCallback(callback) {
    const beforeLength = this.claimCallbacks.length;
    this.claimCallbacks = this.claimCallbacks.filter(cb => cb !== callback);
    if (this.claimCallbacks.length < beforeLength) {
      console.log("Unregistered claim callback, remaining callbacks:", this.claimCallbacks.length);
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
const evmStaffSignalRService = new EvmStaffSignalRService();
export default evmStaffSignalRService;
