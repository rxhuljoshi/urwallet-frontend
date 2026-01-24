import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Filter } from "lucide-react";

const sortOptions = [
    { value: "latest", label: "Latest to Oldest" },
    { value: "oldest", label: "Oldest to Latest" },
    { value: "amount_desc", label: "Amount: High to Low" },
    { value: "amount_asc", label: "Amount: Low to High" },
];

const typeOptions = [
    { value: "all", label: "All Transactions" },
    { value: "income", label: "Income Only" },
    { value: "expense", label: "Expenses Only" },
];

export default function SortFilterControls({ sort, onSortChange, typeFilter, onTypeFilterChange }) {
    return (
        <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={onSortChange}>
                <SelectTrigger className="w-[180px] h-9" data-testid="sort-select">
                    <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={onTypeFilterChange}>
                <SelectTrigger className="w-[160px] h-9" data-testid="filter-select">
                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
