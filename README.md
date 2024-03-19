[![Repository License](https://img.shields.io/badge/license-GPL%20v3.0-brightgreen.svg)](COPYING)

# Fuzzy list of names matcher

This is a tool that takes 2 lists of names and attempts to find the most
likely matches between them.

For instance, given the lists:

| List one | List Two |
| -------- | -------- |
| Alice Anderson | Andy Anderson |
| Bob Barker | Alice Also |
| Charlie Cho | Bob Barker |
| Dave Darcy | C. Cho |
| Ekon Eze | Elon Everton |

it should be able to find you a list in order of most likely matches:

```
Bob Barker -> Bob Barker (Exact)
Charlie Cho -> C. Cho (High)
Alice Anderson -> {Andy Anderson / Alice Also} (Medium)
Ekon Eze -> Elon Everton (Low)
```

it's not 100% foolproof, and is attempting to match optimistically.

An example expected use-case if you have a list of 3000 school alumni,
and want to try and find which of them are now in your current school parents list.

This tool will not give you 100% correct results - but will reduce the space you have
to search through - instead of trying to manually compare 3000 against 500
(1.5 million comparisons...) you can now just manually look through the top 100
with their most likely matches.

Finding incorrect positive match scores is fine, as long as it doesn't introduce
too much noise.

## Authors

fuzzy list of names matcher was created by [Daniel Fairhead](https://github.com/danthedeckie)
and welcomes contributions.

## Licence

GNU General Public Licence v3.0 or later

See [COPYING](COPYING) to see the full text.
