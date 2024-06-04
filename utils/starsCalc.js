exports.calculateStars = (realStars, addedArguments) => {
  let finalStars = realStars;

  for (let i = 1; i <= addedArguments; i++) {
      if (i <= 3) {
          finalStars -= 0.05;
      } else if (i === 4) {
          finalStars += 0.01;
      } else if (i === 5) {
          finalStars += 0.02;
      }
  }

  if (finalStars > 5) {
      finalStars = 5;
  } else if (finalStars < 2) {
      finalStars = 2;
  }

  return finalStars;
}