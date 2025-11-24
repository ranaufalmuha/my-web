import { useCursor } from "../contexts/CursorContext";

export const Navbar = () => {
  const { handleMouseEnter, handleMouseLeave } = useCursor();
  return (
    <nav className="flex justify-center absolute w-full z-20 pointer-events-none">
      <div className="max-w-[1500px] p-10 w-full relative">
        <img
          src="./logo-white.png"
          alt=""
          draggable={false}
          className="w-10 h-10 object-contain pointer-events-auto"
          onMouseEnter={() => handleMouseEnter(2)}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </nav>
  );
};
