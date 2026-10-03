const START_YEAR = 2023;

function Copyright() {
  const currentYear = new Date().getFullYear();
  const year = currentYear > START_YEAR
    ? `${START_YEAR}–${currentYear}`
    : START_YEAR;

  return <>© {year} Ibrahim Karim.</>;
}

export default Copyright;
