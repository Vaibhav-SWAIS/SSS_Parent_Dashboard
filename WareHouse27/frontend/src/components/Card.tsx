interface CardProps {
  title: string;
  value: number | string;
}

function Card({ title, value }: CardProps) {
  return (
    <div className="card">

      <h3>{title}</h3>

      <h1>{value}</h1>

    </div>
  );
}

export default Card;