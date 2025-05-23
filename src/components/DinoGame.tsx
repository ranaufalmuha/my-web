import React, { useState, useEffect, useRef, useCallback } from "react";

const DinoGame: React.FC = () => {
  const canvasHeight = 400;
  const groundHeight = 50;
  const groundY = canvasHeight - groundHeight;

  const [position, setPosition] = useState(groundY);
  const [horizontalPosition, setHorizontalPosition] = useState(50);
  const [velocity, setVelocity] = useState(0);
  // const [horizontalVelocity, setHorizontalVelocity] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [jumpCount, setJumpCount] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  const [canJump, setCanJump] = useState(true); // Flag untuk mencegah spam tombol lompat

  const dinoRef = useRef<HTMLDivElement>(null);
  const cactusRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);

  const GRAVITY = 0.5;
  const JUMP_VELOCITY = -10;
  const HOLD_BOOST = -0.3;
  const HORIZONTAL_SPEED = 5;
  const DINO_WIDTH = 50;
  const JUMP_COOLDOWN = 50; // Cooldown dalam milidetik antara lompatan

  const startGame = () => {
    setIsStarted(true);
    setIsGameOver(false);
    setScore(0);
    setJumpCount(0);
    setPosition(groundY);
    setVelocity(0);
    setHorizontalPosition(50);
    // setHorizontalVelocity(0);
    setCanJump(true);
    if (cactusRef.current) {
      cactusRef.current.style.animation = "cactusMove 3s infinite linear";
    }
  };

  const updateHorizontalPosition = useCallback(() => {
    let newHorizontalVelocity = 0;

    if (keysPressed["ArrowLeft"] || keysPressed["a"] || keysPressed["A"]) {
      newHorizontalVelocity = -HORIZONTAL_SPEED;
    } else if (
      keysPressed["ArrowRight"] ||
      keysPressed["d"] ||
      keysPressed["D"]
    ) {
      newHorizontalVelocity = HORIZONTAL_SPEED;
    }

    // setHorizontalVelocity(newHorizontalVelocity);

    setHorizontalPosition((prev) => {
      const gameAreaWidth = gameAreaRef.current?.clientWidth || 800;
      const newPos = prev + newHorizontalVelocity;

      if (newPos < 0) return 0;
      if (newPos > gameAreaWidth - DINO_WIDTH)
        return gameAreaWidth - DINO_WIDTH;
      return newPos;
    });
  }, [keysPressed]);

  const gameLoop = useCallback(() => {
    // Update posisi vertikal (lompatan)
    setPosition((prev) => {
      let newVelocity = velocity;
      if (isHolding && velocity < 0) {
        newVelocity += HOLD_BOOST;
      }
      newVelocity += GRAVITY;
      let newPos = prev + newVelocity;

      if (newPos >= groundY) {
        newPos = groundY;
        newVelocity = 0;
        // Reset jumpCount hanya ketika karakter benar-benar menyentuh tanah
        if (position < groundY) {
          setJumpCount(0);
          setIsJumping(false);
        }
      }

      setVelocity(newVelocity);
      return newPos;
    });

    // Update posisi horizontal
    updateHorizontalPosition();

    if (dinoRef.current && cactusRef.current) {
      const dinoRect = dinoRef.current.getBoundingClientRect();
      const cactusRect = cactusRef.current.getBoundingClientRect();

      if (
        dinoRect.right > cactusRect.left &&
        dinoRect.left < cactusRect.right &&
        dinoRect.bottom > cactusRect.top &&
        dinoRect.top < cactusRect.bottom
      ) {
        setIsGameOver(true);
        cactusRef.current.style.animation = "none";
        cactusRef.current.style.left = `${cactusRect.left}px`;
        return;
      }
    }

    if (!isGameOver && isStarted) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [
    velocity,
    isHolding,
    isGameOver,
    isStarted,
    updateHorizontalPosition,
    position,
  ]);

  useEffect(() => {
    if (isStarted && !isGameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animationFrameRef.current!);
  }, [isStarted, isGameOver, gameLoop]);

  useEffect(() => {
    let scoreInterval: ReturnType<typeof setInterval>;
    if (isStarted && !isGameOver) {
      scoreInterval = setInterval(() => {
        setScore((prev) => prev + 1);
      }, 100);
    }
    return () => clearInterval(scoreInterval);
  }, [isStarted, isGameOver]);

  const handleJump = useCallback(() => {
    // Cek kondisi lompat dengan pengecekan yang lebih ketat
    if (!canJump || jumpCount >= 2 || isGameOver || !isStarted) return;

    // Set cooldown untuk mencegah multiple jumps
    setCanJump(false);
    setTimeout(() => setCanJump(true), JUMP_COOLDOWN);

    setVelocity(JUMP_VELOCITY);
    setJumpCount((prev) => prev + 1);
    setIsJumping(true);
  }, [jumpCount, isGameOver, isStarted, canJump, position]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Update keysPressed state untuk tombol yang ditekan
      setKeysPressed((prev) => ({ ...prev, [e.key]: true }));

      // Handle lompatan dengan Space
      if (e.code === "Space") {
        e.preventDefault();
        if (!isHolding) {
          handleJump();
        }
        setIsHolding(true);
      }

      // Handle lompatan dengan W atau ArrowUp
      if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        e.preventDefault();
        handleJump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Update keysPressed state untuk tombol yang dilepas
      setKeysPressed((prev) => {
        const newState = { ...prev };
        delete newState[e.key];
        return newState;
      });

      if (e.code === "Space") {
        setIsHolding(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleJump, isHolding]);

  // Respon terhadap perubahan ukuran window
  useEffect(() => {
    const handleResize = () => {
      setHorizontalPosition((prev) => {
        const gameAreaWidth = gameAreaRef.current?.clientWidth || 800;
        if (prev > gameAreaWidth - DINO_WIDTH) {
          return gameAreaWidth - DINO_WIDTH;
        }
        return prev;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Debug state pada render untuk membantu troubleshooting
  const debugInfo = {
    position,
    jumpCount,
    isJumping,
    canJump,
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        ref={gameAreaRef}
        className="relative w-full h-[400px] border-t border-b border-gray-400 overflow-hidden"
      >
        <div
          ref={dinoRef}
          className="absolute w-[50px] h-[50px]rounded-md"
          style={{
            top: `${position}px`,
            left: `${horizontalPosition}px`,
          }}
        >
          <img src="./assets/head.png" alt="" />
        </div>
        <div
          ref={cactusRef}
          className="absolute w-[30px] h-[50px] bg-disabled bottom-0 left-full rounded-sm"
          style={{
            animation: isStarted ? "cactusMove 3s infinite linear" : "none",
          }}
        ></div>
        {/* Debug info */}
        {isStarted && !isGameOver && (
          <div className="absolute top-2 left-2 text-xs bg-black bg-opacity-50 text-white p-1 rounded">
            Jumps: {jumpCount}/2 | On ground:{" "}
            {position >= groundY ? "Yes" : "No"}
          </div>
        )}
      </div>
      <p className="mt-4 text-lg">Score: {score}</p>
      {!isStarted ? (
        <button
          onClick={startGame}
          className="mt-2 bg-accent text-white px-4 py-2 rounded"
        >
          Start Game
        </button>
      ) : isGameOver ? (
        <>
          <p className="text-red-500 text-xl font-semibold mt-2">Game Over!</p>
          <button
            onClick={startGame}
            className="mt-2 bg-accent text-white px-4 py-2 rounded"
          >
            Restart
          </button>
        </>
      ) : (
        <div className="mt-2 flex flex-col items-center">
          <button
            onClick={handleJump}
            className={`bg-disabled text-white px-4 py-2 rounded mb-2 ${
              !canJump || jumpCount >= 2 ? "opacity-50" : ""
            }`}
          >
            Jump ({2 - jumpCount} left)
          </button>
          <div className="flex gap-2">
            <button
              onMouseDown={() =>
                setKeysPressed((prev) => ({ ...prev, ArrowLeft: true }))
              }
              onMouseUp={() =>
                setKeysPressed((prev) => {
                  const newState = { ...prev };
                  delete newState["ArrowLeft"];
                  return newState;
                })
              }
              onTouchStart={() =>
                setKeysPressed((prev) => ({ ...prev, ArrowLeft: true }))
              }
              onTouchEnd={() =>
                setKeysPressed((prev) => {
                  const newState = { ...prev };
                  delete newState["ArrowLeft"];
                  return newState;
                })
              }
              className="bg-disabled text-white px-4 py-2 rounded"
            >
              ←
            </button>
            <button
              onMouseDown={() =>
                setKeysPressed((prev) => ({ ...prev, ArrowRight: true }))
              }
              onMouseUp={() =>
                setKeysPressed((prev) => {
                  const newState = { ...prev };
                  delete newState["ArrowRight"];
                  return newState;
                })
              }
              onTouchStart={() =>
                setKeysPressed((prev) => ({ ...prev, ArrowRight: true }))
              }
              onTouchEnd={() =>
                setKeysPressed((prev) => {
                  const newState = { ...prev };
                  delete newState["ArrowRight"];
                  return newState;
                })
              }
              className="bg-disabled text-white px-4 py-2 rounded"
            >
              →
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">
        <p>Controls: Space/W/↑ to jump, A/← for left, D/→ for right</p>
      </div>
      <style>{`
        @keyframes cactusMove {
          0% { left: 100%; }
          100% { left: -30px; }
        }
      `}</style>
    </div>
  );
};

export default DinoGame;
