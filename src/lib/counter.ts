// Counter animation utility
export function animateCounters() {
  const counters = document.querySelectorAll(".counter");

  const animateCounter = (counter: Element) => {
    const target = parseInt(counter.getAttribute("data-target") || "0");
    const isFloat = counter.getAttribute("data-target")?.includes(".");
    const increment = target / 100;
    let current = 0;

    const updateCounter = () => {
      if (current < target) {
        current += increment;
        if (isFloat) {
          counter.textContent = current.toFixed(1);
        } else {
          counter.textContent = Math.ceil(current).toLocaleString() + "+";
        }
        requestAnimationFrame(updateCounter);
      } else {
        if (isFloat) {
          counter.textContent = target.toString();
        } else {
          counter.textContent = target.toLocaleString() + "+";
        }
      }
    };

    updateCounter();
  };

  // Intersection Observer to trigger animation when in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          if (!counter.classList.contains("animated")) {
            counter.classList.add("animated");
            animateCounter(counter);
          }
        }
      });
    },
    {
      threshold: 0.5,
    },
  );

  counters.forEach((counter) => {
    observer.observe(counter);
  });
}
