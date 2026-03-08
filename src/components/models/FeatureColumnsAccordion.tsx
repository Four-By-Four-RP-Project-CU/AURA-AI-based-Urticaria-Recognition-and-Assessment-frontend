import { Accordion } from "flowbite-react"

type FeatureColumnsAccordionProps = {
  columns?: string[]
}

const FeatureColumnsAccordion = ({ columns }: FeatureColumnsAccordionProps) => {
  const list = columns && columns.length > 0 ? columns : []

  return (
    <Accordion collapseAll>
      <Accordion.Panel>
        <Accordion.Title>Feature Columns</Accordion.Title>
        <Accordion.Content>
          {list.length === 0 ? (
            <p className="text-sm text-slate-500">No columns recorded</p>
          ) : (
            <ul className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              {list.map((column) => (
                <li key={column} className="rounded-md bg-slate-50 px-2 py-1">
                  {column}
                </li>
              ))}
            </ul>
          )}
        </Accordion.Content>
      </Accordion.Panel>
    </Accordion>
  )
}

export default FeatureColumnsAccordion
