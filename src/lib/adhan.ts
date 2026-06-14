// Lecture de l'adhan (app ouverte). Le fichier audio attendu : public/adhan.mp3
// (à fournir par l'utilisateur — recording de son choix, libre de droits).

let audio: HTMLAudioElement | null = null;

function el(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio("/adhan.mp3");
    audio.preload = "auto";
  }
  return audio;
}

/** À appeler depuis un geste utilisateur (clic) pour débloquer l'autoplay. */
export async function unlockAdhan(): Promise<void> {
  try {
    const a = el();
    a.muted = true;
    await a.play();
    a.pause();
    a.currentTime = 0;
    a.muted = false;
  } catch {
    /* autoplay refusé tant qu'il n'y a pas de geste — ignoré */
  }
}

/** Joue l'adhan. Renvoie false si le navigateur a bloqué la lecture. */
export async function playAdhan(): Promise<boolean> {
  try {
    const a = el();
    a.currentTime = 0;
    a.muted = false;
    await a.play();
    return true;
  } catch {
    return false;
  }
}

export function stopAdhan(): void {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
