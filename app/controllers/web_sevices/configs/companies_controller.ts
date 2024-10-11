import Company from '#models/MasterData/Configs/company'
import { CompanyValidator } from '#validators/configs/company'
import type { HttpContext } from '@adonisjs/core/http'

export default class CompaniesController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, response }: HttpContext) {
    await bouncer.with('CompanyPolicy').authorize('view')
    const q = await Company.first()
    return response.ok(q)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('CompanyPolicy').authorize('update')
    const data = request.all()
    const payload = await CompanyValidator.validate(data)
    let company = await Company.first()
    if (company) {
      company.merge(payload)
    } else {
      company = new Company()
      company.merge(payload)
    }
    await company.save()
    return response.ok(company)
  }
}
