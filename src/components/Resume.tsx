// @ts-ignore
import React from "react";

export const Resume = () => {
  return (
    <div className="w-4/5 py-52 px-20 bg-second-background flex flex-col items-end justify-center gap-20 relative">
      <hr className="border-gradient-to-t absolute top-0 right-0 h-full" />

      <div className="flex gap-10 items-center w-full max-w-[600px] hover:scale-110 duration-300 group">
        <img
          src="./assets/cv.png"
          alt=""
          className="bg-disabled object-cover w-[200px] aspect-square"
        />
        <div className="flex flex-col gap-2">
          <p className="text-4xl max-w-[400px]">Resume</p>
          <div className="max-h-0 overflow-hidden group-hover:max-h-40 duration-300">
            <a
              href="./docs/CV-Web3_&_Smart_Contract_Developer.pdf"
              target="_blank"
              className="capitalize duration-300 bg-white text-black p-4"
            >
              Look Now!
            </a>
          </div>
        </div>
      </div>
      <div className="flex gap-10 items-center w-full max-w-[600px] hover:scale-110 duration-300 group">
        <img
          src="./assets/resume.png"
          alt=""
          className="bg-disabled object-cover w-[200px] aspect-square"
        />
        <div className="flex flex-col gap-2">
          <p className="text-4xl max-w-[400px]">Curriculum Vitae (CV)</p>
          <div className="max-h-0 w-full overflow-hidden group-hover:max-h-40 duration-300">
            <a
              href="./docs/CV-Web3_&_Smart_Contract_Developer.pdf"
              target="_blank"
              className="capitalize duration-300 bg-white text-black p-4"
            >
              Look Now!
            </a>
          </div>
        </div>
      </div>
      <div className="flex gap-10 items-center w-full max-w-[600px] hover:scale-110 duration-300 group">
        <img
          src="./assets/portfolio.png"
          alt=""
          className="bg-disabled object-cover w-[200px] aspect-square"
        />
        <div className="flex flex-col gap-2">
          <p className="text-4xl max-w-[400px]">Portfolio</p>
          <div className="max-h-0 overflow-hidden group-hover:max-h-40 duration-300">
            <a
              href="https://www.canva.com/design/DAGFmJVuenY/CnPaXDeyvtMFdJNsbOknVg/edit?utm_content=DAGFmJVuenY&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
              target="_blank"
              className="capitalize duration-300 bg-white text-black p-4"
            >
              Look Now!
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
