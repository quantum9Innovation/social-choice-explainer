#import "@preview/touying:0.5.3": *
#import "@preview/cetz:0.3.1"
#import "@preview/cetz-plot:0.1.0"
#import "@preview/fletcher:0.5.8" as fletcher: diagram, node, edge
#import themes.stargazer: *

#let date = datetime(
  year: 2025,
  month: 9,
  day: 29,
).display("[month repr:long] [day padding:none], [year]")
#show: stargazer-theme.with(
  aspect-ratio: "16-9",
  header-right: rect(
    none, fill: gradient.linear(color.rgb(0, 91, 172), black),
    width: (100% + 50pt), height: 100pt
  ),
  config-info(
    title: [An Introduction to Voting],
    subtitle: [
      The basics of social choice theory
    ],
    author: [Ananth Venkatesh],
    date: date,
    institution: [Mandlbavr Institvte of Technology (#smallcaps("mit")) #footnote[Toquos theory was invented here]],
  )
)

#set heading(numbering: "1.1")
#show heading.where(level: 1): set heading(numbering: "1.")
#show figure.caption: emph
#show figure.caption: it => context text(size: 18pt, [#it.supplement #it.counter.display(): #it.body])

#let cat = name => sub(size: 14pt)[#name]

#let vec = sym => math.bold(math.upright(sym))
#let unit = sym => math.hat(vec(sym))

#title-slide()

= What is voting?

== An Introduction

- Have some description of preferences among some choices/candidates (*alternatives*) for each individual

- Have many individuals (these form a *society*)

- Want to combine individual preferences to find the *socially optimal choice*

== Plurality Voting

- We ask each voter for their *favorite choice*

- *Count* up the votes for each choice

- Winner is the choice with the *most votes*

== Some Issues

- If many candidates with similar positions run, they *split the vote*

- Winning candidate is not necessarily supported by a *majority*

- Leads to a *two-party system* (Duverger's Law)

= Is democracy possible?

== Ranked-Choice Voting Systems

- Instead of only asking for a first choice, we ask for a *ranking of all choices*

- How we sum up the rankings depends on what *voting system* we use

- *Instant-runoff voting* (IRV)

  - If a choice has a *majority of first-place votes*, it wins
  
  - If not, the choice with the *fewest first-place votes is eliminated*, and the process repeats
 
#pagebreak()
  
- *Borda count*

  - Assign each choice a *score equal to its ranking*
    - Here, first place ranking gets $"points" = "number of candidates" - 1$
    - Last place gets $"points" = 0$
  
  - *Sum* up all the scores, and choose the candidate with the *highest score*
  
== Arrow's Impossibility Theorem

- It turns out it is not possible to have a voting system that satisfies all of the following conditions:

  - *Universal domain*: A winner is always selected, regardless of voter preferences
  
  - *Non-dictatorship*: A single voter does not determine the outcome of the election
  
  - *Unanimity*: A unanimous first place choice should always win
  
  - *Independence of irrelevant alternatives* (IIA): Adding a new candidate that doesn't win shouldn't change the result of the election

== Condorcet winners

- If we *relax universal domain*, we can choose a winner satisfying non-dictatorship, unanimity, and IIA
  - But only in certain cases!

- Find the candidate that *beats every other candidate* in a pairwise comparison, if one exists
  - Candidate ranked higher on more ballots wins
  
- Doesn't exist when we have *Condorcet cycles*
  
= Models of voting

== The Spatial Voting Model

- We model the things voters care about (their preferences) as *points* in space

- We model candidates' positions as points in space also

- Voters prefer the *candidates closest to them* (they support candidates with beliefs closest to their own)

- Voters rank candidates in order of distance; the so-called *Euclidean model*

== Things to observe

- Play with different geometries in the simulation (drag candidate points around)

- Use different voter distributions

- Why does plurality cause a two-party system?
  - Hint: what does vote splitting look like geometrically?
  
- What are the differences between plurality, IRV, and Borda count?

- Can you create a scenario where no Condorcet winner exists?
  - Single-peaked preferences prevent this in one-dimension, but not in higher dimensional spatial voting models
