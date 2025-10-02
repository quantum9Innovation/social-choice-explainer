# social-choice-explainer
Intro to social choice theory

## Spatial Voting Model Visualization

An interactive web application that demonstrates spatial voting models in 2D space.

### Features

- **Interactive Canvas**: Visualize candidates and voters in a 2D spatial model
- **Draggable Candidates**: Move candidate positions by clicking and dragging
- **Multiple Voter Distributions**:
  - Uniform (Random): Voters distributed evenly across the space
  - Normal (Gaussian): Voters concentrated in the center
  - Clustered: Voters grouped around candidates
- **Spatial Voting**: Each voter supports the nearest candidate
- **Region Visualization**: Color-coded regions show which candidate dominates each area

### Usage

Open `index.html` in a web browser to start the visualization. You can:

1. Adjust the number of candidates (2-10)
2. Set the number of voters (0-1000)
3. Choose a voter distribution type
4. Click "Spawn Voters" to add voter points
5. Drag candidate circles to see how regions change
6. Toggle region coloring on/off

### How It Works

The application uses a spatial voting model where:
- Each voter supports the candidate closest to them (Euclidean distance)
- The canvas is divided into Voronoi-like regions showing candidate support
- Moving candidates dynamically updates the regions and voter preferences

This demonstrates key concepts in social choice theory and spatial models of political competition.
