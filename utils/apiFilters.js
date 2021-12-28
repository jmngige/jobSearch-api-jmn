class ApiFilters {
    constructor(query, queryStr){
        this.query = query
        this.queryStr = queryStr
    }

    filter() {

        //Advanced filtering
         const queryCopy = {...this.queryStr }

         //remove fields from the queryStr
         const removeFields = ["sort", "limits", "rawQu"]
         removeFields.forEach(el => delete queryCopy[el])

         let queryStr = JSON.stringify(queryCopy)
         queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

        

        this.query = this.query.find(JSON.parse(queryStr))
        return this
     }

     //sorting jobs
     sort(){
         if(this.queryStr.sort){
             //multiple filters values
             const sortBy = this.queryStr.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
         }else{
             this.query = this.query.sort('postingDate')
         }

         return this
     }

     limitFields(){
         if(this.queryStr.limits){
             //adding multiple limits
             const limit = this.queryStr.limits.split(',').join(' ')
             this.query = this.query.select(limit)
         }else{
              this.query = this.query.select("-__v")
         }

         return this
     }

    //  rawQuery(){
    //      if(this.queryStr.rawQu){
    //          const qu = this.queryStr.rawQu.split('-').join(' ')
    //          this.query = this.query.find({$text: {$search: "\"" + qu + "\""}})
    //      }

    //      return this
    //  }

    pagination(){
        const page = parseInt(this.queryStr.page, 10) || 1
        const limit = parseInt(this.queryStr.limit, 10) || 10
        const skipNext = (page - 1) * limit

        this.query = this.query.skip(skipNext).limit(limit)

        return this
    }

}

module.exports = ApiFilters