interface SummaryCardProps {

    title: string;
    value: string | number;

}


function SummaryCard({ title, value }: SummaryCardProps) {


    return (

        <div className="summary-card">

            <h3>
                {title}
            </h3>


            <p>
                {value}
            </p>

        </div>

    );

}


export default SummaryCard;