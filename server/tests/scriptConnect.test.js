// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
const dns = require("dns");
const mongoose = require("mongoose");
const { connectForScript, PUBLIC_DNS } = require("../scripts/connect");

const SRV_URI = "mongodb+srv://user:pw@cluster.example.mongodb.net/db";

describe("connectForScript", () => {
  let connect;
  let setServers;

  beforeEach(() => {
    connect = jest.spyOn(mongoose, "connect");
    setServers = jest.spyOn(dns, "setServers").mockImplementation(() => {});
    jest.spyOn(mongoose, "disconnect").mockResolvedValue();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("connects normally, without touching DNS, when the network allows the lookup", async () => {
    connect.mockResolvedValue(mongoose);

    await connectForScript(SRV_URI);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(setServers).not.toHaveBeenCalled();
  });

  it("retries once with public DNS when the network refuses the SRV lookup", async () => {
    // This is the exact failure that stopped create-admin on the owner's network.
    connect
      .mockRejectedValueOnce(new Error("querySrv ECONNREFUSED _mongodb._tcp.cluster.example.mongodb.net"))
      .mockResolvedValueOnce(mongoose);

    await connectForScript(SRV_URI);

    expect(setServers).toHaveBeenCalledWith(PUBLIC_DNS);
    expect(connect).toHaveBeenCalledTimes(2);
  });

  it("gives up with the real error if the retry fails too", async () => {
    connect
      .mockRejectedValueOnce(new Error("querySrv ECONNREFUSED _mongodb._tcp.cluster.example.mongodb.net"))
      .mockRejectedValueOnce(new Error("bad auth : authentication failed"));

    await expect(connectForScript(SRV_URI)).rejects.toThrow(/authentication failed/);
    expect(connect).toHaveBeenCalledTimes(2);
  });

  it("does not hide a wrong password, or any other real problem, behind a retry", async () => {
    connect.mockRejectedValue(new Error("bad auth : authentication failed"));

    await expect(connectForScript(SRV_URI)).rejects.toThrow(/authentication failed/);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(setServers).not.toHaveBeenCalled();
  });

  it("does not retry a plain mongodb:// address, which needs no SRV lookup", async () => {
    connect.mockRejectedValue(new Error("querySrv ECONNREFUSED something"));

    await expect(connectForScript("mongodb://127.0.0.1:27017/db")).rejects.toThrow(/querySrv/);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(setServers).not.toHaveBeenCalled();
  });
});
