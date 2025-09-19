# Agent Instructions for "Fun Games for Kids" Repository

Welcome, agent! This file provides instructions for working with this repository.

## Repository Overview

This repository contains a collection of simple, browser-based games for young children. The project is built with plain HTML, CSS, and JavaScript.

**URL:** [https://y-maeda1116.github.io/games/](https://y-maeda1116.github.io/games/)

## File Structure

The repository has a flat structure. The main menu is `index.html`.

Each game is self-contained in a set of three files:
- `[game_name].html`: The structure of the game page.
- `[game_name].css`: The styling for the game.
- `[game_name].js`: The game logic.

For example, the matching game consists of:
- `matching_game.html`
- `matching_game.css`
- `matching_game.js`

Image assets for the games are located in corresponding `images_[game_name]/` directories.

## Development Guidelines

- **Client-Side Only**: All code runs entirely in the client's browser. There is no backend, database, or build process.
- **No Dependencies**: The project uses vanilla HTML, CSS, and JavaScript. Do not add any external libraries, frameworks, or dependencies (like jQuery, React, etc.) unless specifically instructed.
- **Simplicity is Key**: The target audience is young children. Keep the games and UI simple, intuitive, and colorful.
- **Testing**: To test your changes, simply open the relevant HTML file in a web browser. There is no automated test suite. Visual confirmation is sufficient.
- **Adding a New Game**: If you are asked to add a new game, create a new set of `[new_game_name].html`, `[new_game_name].css`, and `[new_game_name].js` files. Then, add a link to the new game in `index.html`.
