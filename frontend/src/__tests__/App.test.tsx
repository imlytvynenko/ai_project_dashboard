import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

describe("App Component", () => {
  test("renders RewardOps Analytics Dashboard title", () => {
    render(<App />);
    const titleElement = screen.getByText(/RewardOps Analytics Dashboard/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("renders POC subtitle", () => {
    render(<App />);
    const subtitleElement = screen.getByText(/Natural Language Business Intelligence POC/i);
    expect(subtitleElement).toBeInTheDocument();
  });

  test("renders test button", () => {
    render(<App />);
    const buttonElement = screen.getByText(/Test Interaction/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test("renders frontend working message", () => {
    render(<App />);
    const messageElement = screen.getByText(/Frontend is Working!/i);
    expect(messageElement).toBeInTheDocument();
  });
});
