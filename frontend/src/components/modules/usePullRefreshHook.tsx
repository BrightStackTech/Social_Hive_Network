import {
    useEffect, 
} from 'react'
import {
    FaArrowDown
  } from 'react-icons/fa'
const MAX = 128;
const k = 0.4;
function appr(x: number) {
  return MAX * (1 - Math.exp((-k * x) / MAX));
}
export function usePullToRefresh(
    ref: React.RefObject<HTMLDivElement>,
    onTrigger: () => void
  ) {
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
  
      // attach the event listener
      el.addEventListener("touchstart", handleTouchStart);
  
      function handleTouchStart(startEvent: TouchEvent) {
        const el = ref.current;
        if (!el) return;
  
        // get the initial Y position
        const initialY = startEvent.touches[0].clientY;
        el.classList.remove("border-r-[1px]");
  
        el.addEventListener("touchmove", handleTouchMove);
        el.addEventListener("touchend", handleTouchEnd);
  
        function handleTouchMove(moveEvent: TouchEvent) {
            const el = ref.current;
            if (!el) return;
          
            // get the current Y position
            const currentY = moveEvent.touches[0].clientY;
          
            // get the difference
            const dy = currentY - initialY;
            const parentEl = el.parentNode as HTMLDivElement;
            if (dy > 100) {
                flipArrow(parentEl);
            } else if (dy > 50) {
                addPullIndicator(parentEl);
            } else {
                removePullIndicator(parentEl);
            }
            // if (dy < 0) return;

          
            // now we are using the `appr` function
            el.style.transform = `translateY(${appr(dy)}px)`;
        }
  
        function handleTouchEnd(endEvent:TouchEvent) {
            const el = ref.current;
            if (!el) return;
            el.classList.add("border-r-[1px]")
            // return the element to its initial position
            el.style.transform = "translateY(0)";
            removePullIndicator(el.parentNode as HTMLDivElement);

          
            // add transition
            el.style.transition = "transform 0.2s";
            const y = endEvent.changedTouches[0].clientY;
            const dy = y - initialY;
            if (dy > 100) {
              onTrigger();
            }
            // listen for transition end event
            el.addEventListener("transitionend", onTransitionEnd);
          
            // cleanup
            el.removeEventListener("touchmove", handleTouchMove);
            el.removeEventListener("touchend", handleTouchEnd);
        }
        function onTransitionEnd() {
            const el = ref.current;
            if (!el) return;
          
            // remove transition
            el.style.transition = "";
          
            // cleanup
            el.removeEventListener("transitionend", onTransitionEnd);
          }


// ...


function addPullIndicator(el: HTMLDivElement) {
  const indicator = el.querySelector(".pull-indicator");
  if (indicator) {
    // already added
    // make sure the arrow is not flipped
    if (indicator.classList.contains("flip")) {
      indicator.classList.remove("flip");
    }
    return;
  }

  const pullIndicator = document.createElement("div");
  pullIndicator.className = "pull-indicator";

  // Create a span element for the arrow
  const arrowSpan = document.createElement("span");
  arrowSpan.innerHTML = (FaArrowDown({}) as any).props.children[0].props.d;
  arrowSpan.style.display = 'inline-block';
  arrowSpan.style.width = '20px';
  arrowSpan.style.height = '20px';

  // Create an SVG element
  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.setAttribute("viewBox", "0 0 448 512"); // ViewBox for FontAwesome icons
  svgElement.style.width = '100%';
  svgElement.style.height = '100%';

  // Create a path element
  const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
  pathElement.setAttribute("d", arrowSpan.innerHTML);
  pathElement.setAttribute("fill", "currentColor");

  // Append the path to the SVG, and the SVG to the span
  svgElement.appendChild(pathElement);
  arrowSpan.innerHTML = '';
  arrowSpan.appendChild(svgElement);

  // Append the arrow span to the pull indicator
  pullIndicator.appendChild(arrowSpan);

  el.appendChild(pullIndicator);
}


function removePullIndicator(el: HTMLDivElement) {
  const pullIndicator = el.querySelector(".pull-indicator");
  if (pullIndicator) {
    pullIndicator.remove();
  }
}

function flipArrow(el: HTMLDivElement) {
  const pullIndicator = el.querySelector(".pull-indicator");
  if (pullIndicator && !pullIndicator.classList.contains("flip")) {
    pullIndicator.classList.add("flip");
  }
}
      }
  
      return () => {
        // let's not forget to cleanup
        el.removeEventListener("touchstart", handleTouchStart);
      };
    }, [ref.current]);
  }
