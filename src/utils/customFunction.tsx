import { CheckCircle2, CircleX } from "lucide-react";
import { toast } from "sonner";

const showSuccessAlert = (title: string, description: string) => {
    toast(
      <div className="flex items-start gap-3">
        <CheckCircle2 className="text-green-500 mt-0.5" />
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>,
      { duration: 3000 }
    )
  }

const showErrorAlert = (title: string, description: string) => {
  toast(
    <div className="flex items-start gap-3">
      <CircleX className="text-red-500 mt-0.5" />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>,
    { duration: 3000 }
  )
}

// docker run --name mysql-school -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=school_db -p 3306:3306 -v mysql_school_data:/var/lib/mysql -d mysql
// npx prisma db push

export {showErrorAlert, showSuccessAlert};